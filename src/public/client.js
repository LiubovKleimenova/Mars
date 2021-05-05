let store = {
	user: { name: "Student" },
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
};

// create content
const App = (state) => {
	console.log(state);
	return `
        <div class="bg-dark bg-space">
            <header class="container">
                <nav>
                    ${Nav(state.rovers, state.roverImages)}
                </nav>
            </header>
            <main class="container text-light">
                ${Main(state)}
            </main>


            <footer></footer>
        <div>
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
            <h1>Welcome, ${name}!</h1>
        `;
	}

	return `
        <h1>Hello!</h1>
    `;
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
	// If image does not already exist, or it is not from today -- request it again
	const today = new Date();
	if (!apod || apod.image.date === today.getDate()) {
		getImageOfTheDay(store);
		console.log(1);
	} else {
		// check if the photo of the day is actually type video!
		if (apod.media_type === "video") {
			return `
                <p>See today's featured video <a href="${apod.url}">here</a></p>
                <p>${apod.title}</p>
                <p>${apod.explanation}</p>
            `;
		} else {
			return `
                <img src="${apod.image.url}" alt="${apod.image.title}" width="60%" />
                <h2>${apod.image.title}</h2>
                <p>${apod.image.explanation}</p>
            `;
		}
	}
};

const Nav = (rovers, roverImages) => {
	if (roverImages.length > 0) {
		return `<button onclick='clearRoverData()'>Back to Main Page</button>`;
	} else {
		return Buttons(rovers).join("");
	}
};

const Main = (state) => {
    const {roverImages, apod } = state;
    console.log(roverImages);
	if (roverImages.length > 0) {
		return Slider(roverImages);
	} else {
		return ImageOfTheDay(apod)
	}
};

//HOF that return other fn
const Buttons = (rovers) => {
	return rovers.map((rover) => generateElement(rover, Button));
};

const Button = (rover) => {
	return `
            <button id="${rover.toLowerCase()}" class="btn btn-primary" onclick="updateRover('${rover.toLowerCase()}')">${rover}</button>
        `;
};

const Images = (images) => {
    return images.map(image => generateElement(image, Img))
}

const Img = (image) => {
    return `<img src="${image.img_src}" alt="Made with ${image.camera.full_name} at ${image.earth_date}"/>`
}

const Slider = (images) => {
    return (`
        <div id="slider">
            ${Images(images).join("")}
        </div>
    `)
}

//HOF THAT takes callback fn
const generateElement = (data, callback) => {
	return callback(data);
};

const updateRover = (rover) => {
	getRoverImages(rover);
	//getRoverDetails(rover);
};

const clearRoverData = () => {
	updateStore(store, { roverImages: [], roverInfo: {} });
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
	fetch(`http://localhost:3000/apod`)
		.then((res) => res.json())
		.then((apod) => updateStore(store, { apod }));
};

const getRoverImages = (name) => {
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
			//updateStore(store, { roverImages });
		});
};

const getRoverDetails = (name) => {
	fetch(`http://localhost:3000/rover/${name}/info`)
		.then((res) => res.json())
		.then((roverInfo) => updateStore(store, { roverInfo }));
};
