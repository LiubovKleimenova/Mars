let store = {
	user: { name: "" },
	apod: "",
	rovers: ["Curiosity", "Opportunity", "Spirit"],
	roverName: "",
	roverImages: [],
	roverInfo: "",
};

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (state, newState) => {
	state = Object.assign(state, newState);
	render(root, state);
};

const render = async (root, state) => {
	root.innerHTML = App(state);

    let slider = document.getElementById('slider');
    if (slider) {
        //jquery needed for slider JS
        $('#slider').slick({
            infinite: true,
            slidesToShow: 1,
            slidesToScroll:1
        });
    }
};

// create content
const App = (state) => {
	console.log(state);
	return `
        <div class="bg-dark bg-space d-flex align-items-center">
            <div class="container text-light">
                <header class="text-center mb-4">
                    <h4 class="m-0">${Greeting(state.user.name)}</h4>
                    <div></div>
                    ${Nav(state)}
                </header>
                <main class="text-light">
                    ${Main(state)}
                </main>
                <footer></footer>
            </div>
        </div>
        ${ModalForm(state)}
        `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
	render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
	if (name) {
		return `
            <h1>Welcome to Space, ${name}!</h1>
        `;
	}

	return `
        <h1>Hello Stranger!</h1>
    `;
};

// Components
const ImageOfTheDay = (apod) => {
	// If image does not already exist, or it is not from today -- request it again
	const today = new Date();
	if (!apod || apod.image.date === today.getDate()) {
		getImageOfTheDay(store);
	} else {
		// check if the photo of the day is actually type video!
		if (apod.media_type === "video") {
			return `
                <p>See today's featured video <a href="${apod.url}">here</a></p>
                <p>${apod.title}</p>
                <p class="m-0">${apod.explanation}</p>
            `;
		} else {
			return `
                <h2 class="text-center mt-5">Photo of the Day: ${apod.image.title}</h2>
                <figure class="figure">
                    <img src="${apod.image.url}" alt="${apod.image.title}" class="apod-image figure-img" />
                    <figcaption class="figure-caption text-light">${apod.image.explanation}</figcaption>
                </figure>
            `;
		}
	}
};

const Nav = (state) => {
	if (state.roverImages.length > 0) {
		return `<button onclick='clearRoverData()' class="btn btn-light">Back to the Image of the Day</button>`;
	} else {
		return `
        <h5>Choose a rover to see images</h5>
        <nav>
            ${Buttons(state.rovers).join("")}
        </nav>
        `;
	}
};

const Main = (state) => {
	const { roverImages, apod } = state;

	if (roverImages.length > 0) {
		return Slider(roverImages);
	} else {
		return ImageOfTheDay(apod);
	}
};

const Buttons = (rovers) => {
	return rovers.map((rover) => generateElement(rover, Button));
};

const Button = (rover) => {
	return `
            <button id="${rover.toLowerCase()}" class="btn btn-primary" onclick="updateRover('${rover.toLowerCase()}')">${rover}</button>
        `;
};

const Images = (images) => {
	return images.map((image) => generateElement(image, Img));
};

const Img = (image) => {
	return `<img src="${image.img_src}" alt="Made with ${image.camera.full_name} at ${image.earth_date}"/>`;
};

const Slider = (images) => {
	return `
        <div id="slider">
            ${Images(images).join("")}
        </div>
    `;
};

const ModalForm = (state) => {
	if (state.user.name) {
		return ``;
	}
	return `
     <div class="modal-wrapper fade show d-block">
        <div class="modal-dialog-centered w-100 justify-content-center">
                <form class="d-flex flex-column bg-light p-4 card" onsubmit="updateName(event)">
                    <label for="name" class="">Enter Your Name, Astronaut</label>
                    <input type="text" id="name" name="name" placeholder="Niel Armstrong" class="my-3" tabindex="1" required>
                    <button type="Submit" class="btn btn-dark">Go to Space</button>
                </form>
        </div>
    </div>   
    `;
};

const generateElement = (data, callback) => {
	return callback(data);
};

// callbacks for event listeners
const updateRover = (rover) => {
	getRoverData(rover);
};

const clearRoverData = () => {
	updateStore(store, { roverImages: [], roverInfo: {} });
};

const updateName = (e) => {
	e.preventDefault();
	let user = { name: e.target.querySelector("#name").value };

	updateStore(store, { user });
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
	fetch(`http://localhost:3000/apod`)
		.then((res) => res.json())
		.then((apod) => updateStore(store, { apod }));
};

const getRoverData = (name) => {
	fetch(`http://localhost:3000/rover/${name}/images`)
		.then((res) => {
			return res.json();
		})
		.then((roverImages) => {
			fetch(`http://localhost:3000/rover/${name}/info`)
				.then((res) => res.json())
				.then((roverInfo) =>
					updateStore(store, {
						roverImages,
						roverInfo: roverInfo.photo_manifest,
					})
				);
		});
};
