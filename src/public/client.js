let store = Immutable.Map({
	user: "",
	apod: "",
	rovers: Immutable.List(["Curiosity", "Opportunity", "Spirit"]),
	roverImages: Immutable.List([]),
    roverInfo: ""
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
    
	if (state.get("roverImages").size > 0) {
		initSlider();
	}
};

// create content
const App = (state) => {
	const user = state.get("user");
	const apod = state.get("apod");
	const rovers = state.get("rovers");
	const roverImages = state.get("roverImages");
	const roverInfo = state.get("roverInfo");

	return `
        <div class="bg-dark bg-space d-flex align-items-center position-relative">
            <div class="bg-stars">
                <div class="container text-light">
                    <header class="text-center mb-4">
                        <h4 class="m-0">${Greeting(user)}</h4>
                        <div></div>
                        ${Nav(rovers, roverImages)}
                    </header>
                    <main class="text-light">
                        ${Main(apod, roverImages, roverInfo)}
                    </main>
                    <footer></footer>
                </div>
                ${Stars()}
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
            <h1 class="pt-5">Welcome to Space, ${name}!</h1>
        `;
	}

	return `
        <h1 class="pt-5">Hello Stranger!</h1>
    `;
};

const ImageOfTheDay = (apod) => {
	// If image does not already exist, or it is not from today -- request it again
	const today = new Date();
	if (!apod || apod.getIn(["image", "date"]) === today.getDate()) {
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
	if (roverImages.size > 0) {
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

const Main = (apod, roverImages, roverInfo) => {
	if (roverImages.size > 0) {
		return `
            ${Fact(roverInfo)}
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
	return `
    <div class="mx-2">
        <img src="${image.get("img_src")}" alt="Made with ${image.getIn([
		"camera",
		"full_name",
	])} at ${image.get("earth_date")}"/>
    </div>
    `;
};

const Fact = (roverInfo) => {
	return `
    <div class="my-3 mx-3 mx-lg-5 px-lg-5">
        These are the most recent photos taken by ${roverInfo.get("name")} 
        that was launched at ${roverInfo.get("launch_date")}.
        Rover landed at ${roverInfo.get("landing_date")} and since then 
        spent ${roverInfo.get("max_sol")} sols on the surface 
        of Mars and made ${roverInfo.get("total_photos")} photos.

        Current Project Status is ${roverInfo.get("status")}
    </div>
    `;
};

const Slider = (images) => {
	return `
        <div id="slider">
            ${Images(images).join("")}
        </div>
    `;
};

const initSlider = () => {
    //Initializing Slider - jquery is required by the library
		$("#slider").slick({
			infinite: true,
			slidesToShow: 3,
			slidesToScroll: 1,
			autoplay: true,
			autoplaySpeed: 2000,
			arrows: false,
			pauseOnHover: false,
			responsive: [
				{
					breakpoint: 980,
					settings: {
						slidesToShow: 2,
						slidesToScroll: 2,
						infinite: true,
						dots: true,
					},
				},
				{
					breakpoint: 768,
					settings: {
						slidesToShow: 1,
						slidesToScroll: 1,
					},
				}
			],
		});
}

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

const Stars = () => {
	return `
        <div class="shooting_star"></div>
        <div class="shooting_star"></div>
        <div class="shooting_star"></div>
        <div class="shooting_star"></div>
        <div class="shooting_star"></div>
        <div class="shooting_star"></div>
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
	const user = e.target.querySelector("#name").value;
	store = store.set("user", user);

	render(root, store);
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = () => {
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
				.then((roverInfo) => {
					updateStore(store, {
						roverImages: roverImages.latest_photos,
						roverInfo: roverInfo,
					});
				});
		});
};
