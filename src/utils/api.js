// Utility function to get the correct base path for API calls
export const getApiBasePath = () => {
    // Check if we're running on GitHub Pages by looking at the current location
    if (typeof window !== 'undefined') {
        const isGitHubPages = window.location.hostname === 'tcouch.github.io' &&
            window.location.pathname.startsWith('/IAD')
        return isGitHubPages ? '/IAD' : ''
    }
    // Fallback for SSR or when window is not available
    return ''
}

// Helper function to make API calls with the correct base path
export const apiCall = async (endpoint) => {
    const basePath = getApiBasePath()
    const url = `${basePath}${endpoint}`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }
    return response.json()
}

// Helper function to get the correct image path
export const getImagePath = (imagePath) => {
    const basePath = getApiBasePath()
    return `${basePath}${imagePath}`
}

// Predefined API endpoints
export const API_ENDPOINTS = {
    collections: {
        index: '/collections/index.json',
        academies: '/collections/academies.json',
        people: '/collections/people.json',
        works: '/collections/works.json'
    },
    items: {
        academies: '/items/academies.json',
        people: '/items/people.json',
        works: '/items/works.json'
    }
} 