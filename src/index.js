document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "http://localhost:3000";
  let availableTickets = 0; // Initialize the available tickets variable.

  // Function to fetch movie details and update the UI
  const fetchAndDisplayMovieDetails = async (filmsId) => {
    try {
      const response = await fetch(`${BASE_URL}/films/${filmsId}`);
      if (!response.ok) {
        throw Error("Failed to fetch movie details.");
      }
      const filmData = await response.json();
      const {
        id,
        title,
        runtime,
        showtime,
        capacity,
        tickets_sold,
        description,
        poster,
      } = filmData;

      // Calculate available tickets
      availableTickets = capacity - tickets_sold; // Update availableTickets

      // Update the DOM elements with movie details
      document.getElementById("poster").src = poster;
      document.getElementById("title").textContent = title;
      document.getElementById("runtime").innerText = `${runtime} minutes`;
      document.getElementById("showtime").textContent = showtime;
      document.getElementById("ticket-num").textContent = availableTickets; // Update available tickets
      document.getElementById("film-info").textContent = description;

      // Add Buy Ticket button event listener
      const buyButton = document.getElementById("buy-ticket");
      buyButton.addEventListener("click", () => {
        buyTicket(id);
      });

      // Add Delete button event listener
      const deleteButton = document.getElementById("delete-film");
      deleteButton.addEventListener("click", () => {
        deleteFilm(id);
      });
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  // Function to update available tickets and handle ticket purchase
  const updateAvailableTickets = () => {
    // Update the number of available tickets in the DOM
    document.getElementById("ticket-num").textContent = availableTickets;
  };

  // Function to simulate a ticket purchase and update the server
  const buyTicket = async (filmId) => {
    try {
      if (availableTickets > 0) {
        // Simulate a ticket purchase (no persistence)
        availableTickets -= 1;

        // Update available tickets on the frontend
        updateAvailableTickets();

        // Simulate updating the server (in reality, you would make an API call)
        const newTicketsSold = capacity - availableTickets;
        const option = {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tickets_sold: newTicketsSold }),
        };

        const response = await fetch(`${BASE_URL}/films/${filmId}`, option);
        if (!response.ok) {
          console.error("Failed to update tickets on the server.");
        }
      }
    } catch (error) {
      console.error("Error purchasing ticket:", error);
    }
  };

  // Function to delete a film by ID
  const deleteFilm = async (filmId) => {
    try {
      const response = await fetch(`${BASE_URL}/films/${filmId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove the film from the menu
        const filmItem = document.getElementById("film-item");
        if (filmItem) {
          filmItem.remove();
          // Clear the movie details
          document.getElementById("poster").src = "";
          document.getElementById("title").textContent = "";
          document.getElementById("runtime").textContent = "";
          document.getElementById("showtime").textContent = "";
          document.getElementById("ticket-num").textContent = "";
          document.getElementById("film-info").textContent = "";
        }
      } else {
        console.error("Failed to delete the film on the server.");
      }
    } catch (error) {
      console.error("Error deleting the film:", error);
    }
  };

  // Function to populate the movie list
  const populateMovieList = async () => {
    try {
      const filmsList = document.getElementById("films");
      const response = await fetch(`${BASE_URL}/films`);
      if (!response.ok) {
        throw new Error("Failed to fetch movie list.");
      }
      const films = await response.json();
      films.forEach((film) => {
        const li = document.createElement("li");
        li.textContent = film.title;
        li.classList.add("film-item");
        li.id = "film-item";
        filmsList.appendChild(li);
        li.addEventListener("click", () => {
          fetchAndDisplayMovieDetails(film.id);
        });
      });
    } catch (error) {
      console.error("Error fetching movie list:", error);
    }
  };

  // Remove the placeholder <li> element if it exists
  const placeholderLi = document.querySelector("#films > li");
  if (placeholderLi) {
    placeholderLi.remove();
  }

  // Call populateMovieList to fetch and display the list of movies
  fetchAndDisplayMovieDetails(1);
  populateMovieList();
});
