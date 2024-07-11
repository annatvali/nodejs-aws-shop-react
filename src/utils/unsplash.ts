import axios from "axios";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

export const getRandomImageUrl = async () => {
  try {
    const response = await axios.get("https://api.unsplash.com/photos/random", {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query: "product",
      },
    });
    return response.data.urls.small;
  } catch (error) {
    console.error("Error fetching random image from Unsplash:", error);
    return "https://via.placeholder.com/300";
  }
};
