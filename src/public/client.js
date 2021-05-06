let store = Immutable.Map({
	user: "",
	apod: "",
	rovers: ["Curiosity", "Opportunity", "Spirit"],
	roverName: "", //delete?
	roverImages: Immutable.List([]),
	roverInfo: "",
});

// add our markup to the page
const root = document.getElementById("root");

const updateStore = (state, newState) => {
	//state = Object.assign(state, newState);
	state = state.merge(newState);
	render(root, state);
};

const render = async (root, state) => {
	root.innerHTML = App(state);

    //const roverImages = state.get('roverImages');
    //let slider = document.getElementById('slider');
    // if (roverImages.length > 0) {
    //     //jquery needed for slider JS
    //     $('#slider').slick({
    //         infinite: true,
    //         slidesToShow: 1,
    //         slidesToScroll:1
    //     });
    // }
};

// create content
const App = (state) => {
	const user = state.get('user');
	const apod = state.get('apod');
	const rovers = state.get('rovers');
	const roverImages = state.get('roverImages');

    //console.log(state)
    console.log(roverImages);
	return `
        <div class="bg-dark bg-space d-flex align-items-center">
            <div class="container text-light">
                <header class="text-center mb-4">
                    <h4 class="m-0">${Greeting(user)}</h4>
                    <div></div>
                    ${Nav(rovers, roverImages)}
                </header>
                <main class="text-light">
                    ${Main(apod, roverImages)}
                </main>
                <footer></footer>
            </div>
        </div>
        ${ModalForm(user)}
        `;
};

// listening for load event because page should load before any JS is called
window.addEventListener("load", () => {
	render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure functions for components
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

const ImageOfTheDay = (apod) => {
	// If image does not already exist, or it is not from today -- request it again
	const today = new Date();
	if (!apod || apod.getIn(['image', 'date']) === today.getDate()) {
		getImageOfTheDay(store);
	} else {
        const title = apod.getIn(["image", "title"]);
        const explanation = apod.getIn(["image", "explanation"]);
        const url = apod.getIn(["image", "url"]);
		// check if the photo of the day is actually type video!
		if (apod.media_type === "video") {
			return `
                <p>See today's featured video <a href="${url}">here</a></p>
                <p>${title}</p>
                <p class="m-0">${explanation}</p>
            `;
		} else {
			
			return `
                <h2 class="text-center mt-5">Photo of the Day: ${title}</h2>
                <figure class="figure">
                    <img src="${url}" alt="${title}" class="apod-image figure-img" />
                    <figcaption class="figure-caption text-light">${explanation}</figcaption>
                </figure>
            `;
		}
	}
};

const Nav = (rovers, roverImages) => {
	if (roverImages.length > 0) {
		return `<button onclick='clearRoverData()' class="btn btn-light">Back to the Image of the Day</button>`;
	} else {
		return `
        <h5>Choose a rover to see images</h5>
        <nav>
            ${Buttons(rovers).join("")}
        </nav>
        `;
	}
};

const Main = (apod, roverImages) => {
	if (roverImages.length > 0) {
		return `
            FACT
            ${Slider(roverImages)}
        `;
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

const ModalForm = (user) => {
	if (user) {
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
	let user = e.target.querySelector("#name").value ;
    store = store.set('user', user);

    render(root, store)
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = () => {
	fetch(`http://localhost:3000/apod`)
		.then((res) => res.json())
		.then((apod) => 
            updateStore(store, { apod })
        );
};

const getRoverData = (name) => {
	fetch(`http://localhost:3000/rover/${name}/images`)
		.then((res) => {
			return res.json();
		})
		.then((roverImages) => {
            console.log(roverImages.latest_photos)
			fetch(`http://localhost:3000/rover/${name}/info`)
				.then((res) => res.json())
				.then((roverInfo) =>
					updateStore(store, {
						roverImages: roverImages.latest_photos,
						roverInfo: roverInfo.photo_manifest,
					})
				);
		});
};
