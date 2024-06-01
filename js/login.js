/**
 * Initializes the login process by including HTML, setting default inputs, and starting an animation.
 */
async function loginInit() {
    showOverlay()
    checkIfUserIsRemembered();
}
/**
 * Asynchronously loads the users from the 'contacts' item in local storage and parses it into a JavaScript object.
 * @return {Promise<void>} A promise that resolves when the users have been loaded and parsed.
 */
async function loadUsers() {
    users = await firebaseGetItem(FIREBASE_USERS_ID);
}


function showOverlay() {
    if (!getCurrentUser()) {
        console.log("no user");
        document.getElementById('main').classList.add('hide-scroll');
        document.getElementById("blueOverlay").style.display = "flex";
        startAnimation();
    } else {
        console.log("user already logged in");
        switchPage('summary.html');
    }
}

/**
 * Executes an animation by displaying a blue overlay and adding a logo animation class to the logo element after a delay of 3 seconds.
 */
async function startAnimation() {
    return new Promise(resolve => {
        setTimeout(() => {
            const logo = document.getElementById("logo");
            logo.classList.add("logo-animation");
            setTimeout(() => {
                resolve();
                hideOverlay();
            }, 1000); // Wait for the logo animation to finish (2 seconds)
        }, 1000); // Wait for 3 seconds before starting the animation

    });
}

function hideOverlay() {
    // document.getElementById('loginMainContainer').style.overflow = 'auto';
    document.getElementById("blueOverlay").style.display = "none";
}

// // Delay the overlay display by 5 seconds (5000 milliseconds)
// setTimeout(() => {
//     showOverlay();
// }, 50000);

/**
 * Logs in a user by finding the user with matching email and password in the users array.
 * If a matching user is found, it sets the current user and switches the page to 'summary.html'.
 *
 * @return {boolean} Returns false to prevent the form from submitting again.
 */
async function loginUser() {
    let email = document.getElementById('loginEmailInput').value;
    let password = document.getElementById('loginPasswordInput').value;

    await loadUsers();
    let loggedUser = users.find(user => user.mail == email && user.password == password);
    users = [];

    if (loggedUser) {
        setCurrentUser(loggedUser.name); // sessionStorage
        setRememberMe(loggedUser.name); // localStorage
        switchPage('summary.html');
    } else {
        alert("Invalid email or password. Please try again.");
    }
    return false;
}

function setRememberMe(name) {
    if (document.getElementById('loginCheckbox').hasAttribute('checked')){
        localStorage.setItem('rememberedUser', JSON.stringify({username: name}));
    }
}


/**
 * Toggles the appearance of the remember me checkbox image when clicked.
 */
function toggleRememberMeCheckbox() {
    let loginCheckbox = document.getElementById('loginCheckbox');
    let loginCheckboxImg = document.getElementById('loginCheckboxImg');

    if (loginCheckbox.hasAttribute('checked')) {
        loginCheckboxImg.src = '../../assets/img/icon-check_button_unchecked.png';
        loginCheckbox.removeAttribute('checked');
    } else {
        loginCheckboxImg.src = '../../assets/img/icon-check_button_checked.png';
        loginCheckbox.setAttribute('checked','');
    };
}


/**
 * Switches the page to the summary page for guest login.
 */
function loginAsGuest() {
    switchPage('summary.html');
}



/**
 * Switches the page to the sign up page.
 */
function gotoSignUp() {
    switchPage('signUp.html');
}

// let users = [
//     {
//         id: 1,
//         name: "anton mayer",
//         mail: "antom@gmail.com",
//         password: 'anton',
//         phone: "+49 1111 111 11 1",
//         contactColor: "",
//     },
//     {
//         id: 2,
//         name: "anja schulz",
//         mail: "schulz@hotmail.com",
//         password: 'anja',
//         phone: "+49 1111 111 11 2",
//         contactColor: "#c2e59c",
//     },
//     {
//         id: 3,
//         name: "benedikt ziegler",
//         mail: "benedikt@gmail.com",
//         password: 'benedikt',
//         phone: "+49 1111 111 11 3",
//         contactColor: "#ffcc80",
//     }];




// function setDefaultInputs() {
//     let email = document.getElementById('loginEmailInput');
//     let password = document.getElementById('loginPasswordInput');
//     email.value = "benedikt@gmail.com";
//     password.value = "benedikt";
// }