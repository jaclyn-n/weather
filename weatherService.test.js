const { fetchWeather } = require("./weather");

global.fetch = jest.fn(); // mock fetch

describe("fetchWeather", () => {
  let resultDiv;

  beforeEach(() => {
    resultDiv = { innerHTML: "" };
    fetch.mockClear();
  });

  it("should show weather info when city is found", async () => {
    const fakeGeoData = {
      results: [
        {
          latitude: 5.56,
          longitude: -0.2,
          name: "Accra",
          country: "Ghana",
        },
      ],
    };

    const fakeWeatherData = {
      current_weather: {
        time: "2025-05-18T12:00",
      },
    };

    fetch
      .mockResolvedValueOnce({
        json: async () => fakeGeoData,
      })
      .mockResolvedValueOnce({
        json: async () => fakeWeatherData,
      });

    await fetchWeather("Accra", resultDiv);

    expect(resultDiv.innerHTML).toContain("Accra, Ghana");
    expect(resultDiv.innerHTML).toContain("2025-05-18T12:00");
  });

  it('should show "City not found" when no results', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ results: [] }),
    });

    await fetchWeather("UnknownCity", resultDiv);

    expect(resultDiv.innerHTML).toBe("City not found. Try another.");
  });

  it("should handle fetch error", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    await fetchWeather("Accra", resultDiv);

    expect(resultDiv.innerHTML).toBe("Error getting weather data.");
  });
});
