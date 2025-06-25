import { useQuery } from '@tanstack/react-query';
import { axios } from '@mtbs/shared-lib';

const API_URL = 'http://localhost:8081/api/v1/services';

const fetchServices = async () => {
    // 1. Fetch the raw data object from the API
    const { data: responseData } = await axios.get(API_URL);

    // A good practice: log the raw response to see its structure
    console.log('Raw API Response:', responseData);

    // 2. Check if the response object exists and if its "content" property is an array
    if (responseData && Array.isArray(responseData.content)) {
        // 3. If it is, return the content array directly. This is what our component will use.
        return responseData.content;
    }

    // 4. If the format is not what we expect, log an error and return an empty array to prevent the app from crashing.
    console.error("API response was not in the expected format. Expected a 'content' array.");
    return [];
};

export const useServices = () => {
    return useQuery({
        queryKey: ['services'],
        queryFn: fetchServices,
    });
};