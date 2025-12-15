import toast from 'react-hot-toast';

export const fetchWithRetry = async <T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) {
            throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(fn, retries - 1, delay * 2);
    }
};

export const handleApiError = (error: any, message = 'Ocurrió un error') => {
    console.error(message, error);
    toast.error(message);
};
