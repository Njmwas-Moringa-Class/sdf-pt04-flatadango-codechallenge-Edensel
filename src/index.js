// Your code here

let image = document.querySelector('img#poster')
let title = document.querySelector('div#title.title')
let runTime = document.querySelector('div#runtime.meta')
let descriptor = document.querySelector('div#film-info')
let showTime = document.querySelector('span#showtime.ui.label')
let ticketNum = document.querySelector('span#ticket-num')
let buyTicket = document.querySelector('button#buy-ticket.ui.orange.button')
let unorderedTitles = document.querySelector('ul#films.ui.divided.list')
let tickets = 0

document.addEventListener('DOMContentLoaded', () => {
  // Function to load movie details by ID
  const loadMovieDetails = (movieId) => {
    fetchMovies(`http://localhost:3000/films/${movieId}`).then((obj) => {
      renderObj(obj);
    });
  };

  // Function to update movie menu items
  const updateMovieMenu = (films) => {
    unorderedTitles.innerHTML = ''; // Clear the movie menu
    for (const film of films) {
      let item = document.createElement('li');
      item.className = "film item";
      item.innerText = film.title;
      if (film.tickets_sold === film.capacity) {
        item.classList.add('sold-out');
      }
      unorderedTitles.appendChild(item);
      item.addEventListener('click', () => {
        loadMovieDetails(film.id);
      });
    }
  };

  // Initial load of movie details
  loadMovieDetails(1);

  // Load movie menu
  fetchMovies("http://localhost:3000/films").then((films) => {
    updateMovieMenu(films);
  });
});

async function fetchMovies(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    console.log(response.status);
  }
  const result = await response.json();
  return result;
}

function renderObj(object) {
  image.src = object.poster;
  title.textContent = object.title;
  runTime.innerText = `${object.runtime} minutes`;
  descriptor.innerText = object.description;
  showTime.innerText = object.showtime;
  ticketNum.innerText = object.capacity - object.tickets_sold;

  // Update Buy Ticket button text and class
  if (object.tickets_sold === object.capacity) {
    buyTicket.textContent = "Sold Out";
    buyTicket.classList.add("sold-out");
  } else {
    buyTicket.textContent = "Buy Ticket";
    buyTicket.classList.remove("sold-out");
    buyTicket.addEventListener('click', () => {
      updateTickets(object);
    });
  }
}

async function updateTickets(obj) {
    // Check if tickets are available
    if (obj.tickets_sold < obj.capacity) {
      obj.tickets_sold += 1;
  
      const option = {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tickets_sold: obj.tickets_sold }),
      };
  
      try {
        const response = await fetch(`http://localhost:3000/films/${obj.id}`, option);
        if (response.ok) {
          // Update the frontend
          ticketNum.innerText = obj.capacity - obj.tickets_sold;
          if (obj.tickets_sold === obj.capacity) {
            buyTicket.textContent = "Sold Out";
            buyTicket.classList.add("sold-out");
          }
        } else {
          console.error('Failed to update tickets on the server.');
        }
      } catch (error) {
        console.error('Error updating tickets:', error);
      }
    } else {
      console.log('No more tickets available.');
    }
  }

// Function to delete a film by ID
const deleteFilm = async (filmId) => {
  try {
    const response = await fetch(`http://localhost:3000/films/${filmId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Remove the film from the menu
      const filmItem = document.querySelector(`ul#films.ui.divided.list li.film.item`);
      if (filmItem) {
        filmItem.remove();
      }
    } else {
      console.error('Failed to delete the film on the server.');
    }
  } catch (error) {
    console.error('Error deleting the film:', error);
  }
};
