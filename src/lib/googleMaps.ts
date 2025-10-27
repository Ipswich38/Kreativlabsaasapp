import { Loader } from '@googlemaps/js-api-loader'

interface DentalClinic {
  name: string
  email?: string
  phone?: string
  website?: string
  address: string
  rating?: number
  reviews?: number
  place_id?: string
  business_status?: string
  google_maps_url?: string
}

interface ScrapingParams {
  zipCode?: string
  city?: string
  state?: string
  mustHavePhone?: boolean
  mustHaveWebsite?: boolean
  mustHaveEmail?: boolean
  radius?: number
}

export class GoogleMapsAPI {
  private loader: Loader
  private map: google.maps.Map | null = null
  private service: google.maps.places.PlacesService | null = null

  constructor(apiKey: string) {
    this.loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geometry']
    })
  }

  async initialize(): Promise<void> {
    await this.loader.load()

    // Create a hidden map element for the Places service
    const mapElement = document.createElement('div')
    mapElement.style.display = 'none'
    document.body.appendChild(mapElement)

    this.map = new google.maps.Map(mapElement, {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of USA
      zoom: 4
    })

    this.service = new google.maps.places.PlacesService(this.map)
  }

  async searchDentalClinics(params: ScrapingParams): Promise<DentalClinic[]> {
    if (!this.service) {
      throw new Error('Google Maps service not initialized')
    }

    const location = await this.getLocation(params)
    const query = this.buildSearchQuery(params)

    return new Promise((resolve, reject) => {
      const request: google.maps.places.TextSearchRequest = {
        query,
        location,
        radius: params.radius || 50000, // 50km default radius
        type: 'dentist'
      }

      this.service!.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          this.processResults(results, params)
            .then(clinics => resolve(clinics))
            .catch(error => reject(error))
        } else {
          reject(new Error(`Google Maps search failed: ${status}`))
        }
      })
    })
  }

  private async getLocation(params: ScrapingParams): Promise<google.maps.LatLng> {
    const geocoder = new google.maps.Geocoder()

    let address = ''
    if (params.zipCode) {
      address = params.zipCode
    } else if (params.city && params.state) {
      address = `${params.city}, ${params.state}`
    } else if (params.state) {
      address = params.state
    } else {
      throw new Error('Please provide either ZIP code, state, or city + state')
    }

    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          resolve(results[0].geometry.location)
        } else {
          reject(new Error(`Geocoding failed for "${address}": ${status}`))
        }
      })
    })
  }

  private buildSearchQuery(params: ScrapingParams): string {
    let query = 'dental clinic dentist'

    if (params.city) {
      query += ` in ${params.city}`
    }
    if (params.state) {
      query += ` ${params.state}`
    }
    if (params.zipCode) {
      query += ` ${params.zipCode}`
    }

    return query
  }

  private async processResults(results: google.maps.places.PlaceResult[], params: ScrapingParams): Promise<DentalClinic[]> {
    const clinics: DentalClinic[] = []

    for (const place of results) {
      if (place.business_status !== 'OPERATIONAL') {
        continue
      }

      const clinic: DentalClinic = {
        name: place.name || 'Unknown',
        address: place.formatted_address || '',
        rating: place.rating,
        reviews: place.user_ratings_total,
        place_id: place.place_id,
        business_status: place.business_status,
        google_maps_url: place.url || `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
      }

      // Get additional details
      try {
        const details = await this.getPlaceDetails(place.place_id!)
        if (details) {
          clinic.phone = details.formatted_phone_number
          clinic.website = details.website
          clinic.email = this.extractEmailFromWebsite(details.website)
        }
      } catch (error) {
        console.warn(`Failed to get details for ${clinic.name}:`, error)
      }

      // Apply filters
      if (params.mustHavePhone && !clinic.phone) continue
      if (params.mustHaveWebsite && !clinic.website) continue
      if (params.mustHaveEmail && !clinic.email) continue

      clinics.push(clinic)
    }

    return clinics
  }

  private async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult | null> {
    if (!this.service) return null

    return new Promise((resolve) => {
      const request: google.maps.places.PlaceDetailsRequest = {
        placeId,
        fields: ['formatted_phone_number', 'website', 'url']
      }

      this.service!.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          resolve(place)
        } else {
          resolve(null)
        }
      })
    })
  }

  private extractEmailFromWebsite(website?: string): string | undefined {
    if (!website) return undefined

    // Generate potential email based on domain
    try {
      const domain = new URL(website).hostname.replace('www.', '')
      const commonPrefixes = ['info', 'contact', 'office', 'admin', 'hello']

      // Return the most likely email (this is an estimation)
      return `info@${domain}`
    } catch {
      return undefined
    }
  }
}

// Export a singleton instance
let googleMapsInstance: GoogleMapsAPI | null = null

export async function initializeGoogleMaps(apiKey: string): Promise<GoogleMapsAPI> {
  if (!googleMapsInstance) {
    googleMapsInstance = new GoogleMapsAPI(apiKey)
    await googleMapsInstance.initialize()
  }
  return googleMapsInstance
}

export async function searchDentalClinics(apiKey: string, params: ScrapingParams): Promise<DentalClinic[]> {
  const api = await initializeGoogleMaps(apiKey)
  return api.searchDentalClinics(params)
}