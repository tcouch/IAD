import { useNavigate } from '@tanstack/react-router'
import { getBasePath } from '../router'

// Custom hook for navigation that handles the base path
export const useNavigation = () => {
    const navigate = useNavigate()

    const navigateTo = (path) => {
        const basePath = getBasePath()
        const fullPath = `${basePath}${path}`
        navigate({ to: fullPath })
    }

    return { navigateTo }
}

// Helper function to get the correct URL for external links
export const getFullUrl = (path) => {
    const basePath = getBasePath()
    return `${basePath}${path}`
} 