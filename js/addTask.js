async function addTaskInit(){
    includeHTML();
    await getContactsFromRemoteStorage();
    getContactsOutOfUsers();
    await loadTasksFromRemoteStorage();
    renderAddTaskHTML();
    checkValidity();
}

let tempAssignedContacts = [];
let tempPriority = '';
let tempSubtasks = [];
let isValid = false;
let requiredInputFields = [
    {
        'id': 'addTaskEnterTitleInput',
        'requiredFieldId': 'requiredTitle',
        'idForRedUnderline':  'addTaskEnterTitleInput',
        'state': false
    },
    {
        'id': 'addTaskDueDateInput',
        'requiredFieldId': 'requiredDueDate',
        'idForRedUnderline': 'addTaskDueDateInputContainer',
        'state': false
    }
];

let newTask = 
    {
        'id': 999,
        'type': '',
        'title': '',
        'description': '',
        'subtasks': [],
        'completedSubtasks': [],
        'assignedTo': [],
        'category': 'category-0',
        'priority': '',
        'dueDate': ''
};

function renderAddTaskHTML() {
    let container = document.getElementById('addTaskBody');
    container.innerHTML = '';
    container.innerHTML += renderAddTaskMainContentHTML();
    container.innerHTML += renderAddTaskFooterHTML();
    setTodayDateAsMin();
    setPriority('medium');
    renderContactsToDropdown();
    renderSubtasks();
  }

/**
 * Updates the priority styling for the task buttons based on the selected priority.
 *
 * @param {string} priority - The selected priority ('Urgent', 'Medium', or 'Low').
 */
function setPriority(priority) {
    setPriorityAppearance(priority);
    setPriorityForNewCard(priority);
}


/**
 * Updates the appearance of the priority buttons based on the selected priority.
 *
 * @param {string} priority - The selected priority ('Urgent', 'Medium', or 'Low').
 */
function setPriorityAppearance(priority){
    document.querySelectorAll('.addTaskPriorityButton').forEach(button => {
        button.style.backgroundColor = 'white';
        button.classList.remove('active');
        button.querySelector('.priorityButtonText').style.color = 'black';
        button.querySelector('img').src = `./assets/img/icon-priority_${button.id.toLowerCase().slice(21)}.png`;
    });
    
    const button = document.getElementById(`addTaskPriorityButton${priority}`);
    button.style.backgroundColor = getButtonColor(priority);
    button.classList.add('active');
    button.querySelector('.priorityButtonText').style.color = 'white';
    button.querySelector('img').src = `./assets/img/icon-priority_${priority.toLowerCase()}_white.png`;
}


/**
 * Sets the priority for a new card.
 *
 * @param {string} priority - The priority level of the new card.
 */
function setPriorityForNewCard(priority){
    newTask.priority = priority;
}


/**
 * Renders the subtask input field by setting the innerHTML of the 'subtaskBottom' element to the HTML code 
 * generated by the 'renderSubtaskInputFieldHTML' function. Then, sets the focus on the 'subtaskInputField' element.
 */
function renderSubtaskInputField(){
    let subtaskBottom = document.getElementById('subtaskBottom');
    subtaskBottom.innerHTML = renderSubtaskInputFieldHTML();
    document.getElementById('subtaskInputField').focus();
}


/**
 * Renders the HTML code for a subtask input field with an "Add" button and a "Cancel" button.
 *
 * @return {string} The HTML code for the subtask input field.
 */
function renderSubtaskInputFieldHTML(){
   return /*html*/`
    <input type="text" id="subtaskInputField" placeholder="Add new subtask" onclick="doNotClose(event)">
    <div class="subtaskAddOrCancel">
        <div id="subtaskImgAddCheck" class="subtaskImgDiv pointer" onclick="subtaskAddOrCancel('add'); doNotClose(event)"></div>
        <div class="vLine"></div>
        <div id="subtaskImgAddCancel" class="subtaskImgDiv pointer" onclick="subtaskAddOrCancel('cancel'); doNotClose(event)"></div>
    </div>`
}


/**
 * Handles adding or canceling a subtask based on the option provided.
 *
 * @param {string} option - The option to add or cancel a subtask.
 */
function subtaskAddOrCancel(option) {
    let subtaskBottom = document.getElementById('subtaskBottom');
    let subtaskInputField = document.getElementById('subtaskInputField');
    if (option == 'add') {
        if (subtaskInputField.value != '') {
            addSubtask();
        }
    }
    subtaskBottom.innerHTML = renderSubtaskDefaultHTML();
    subtaskBottom.setAttribute('onclick', 'renderSubtaskInputField()');
}


/**
 * Renders the default HTML for a subtask, including an input field and an image for adding a new subtask.
 *
 * @return {string} The default HTML for a subtask.
 */
function renderSubtaskDefaultHTML(){
    return /*html*/`<div id="subtaskInputFieldDiv">Add new subtask</div>
    <div id="subtaskImgAddPlus" class="subtaskImgDiv pointer"></div>
    `
}


/**
 * Adds a new subtask to the list of tasks.
 */
function addSubtask(){
    let subtaskInputField = document.getElementById('subtaskInputField');
    if(subtaskInputField.value != ''){

        newTask.subtasks.push({
            'id': newTask.subtasks.length,
            'subtaskText' : subtaskInputField.value,
            'completed': false
        })
    }
        else{
            // TODO:
            console.log("Bitte eingeben!");
        }
    renderSubtasks();
}


/**
 * Renders the subtasks by iterating through each subtask and calling the renderSubtaskHTML function.
 */
function renderSubtasks(){
    let outputContainer = document.getElementById('subtasksOutputContainer');
    outputContainer.innerHTML = '';
    for (let i = 0; i < newTask.subtasks.length; i++) {
        let subtask = newTask.subtasks[i];
        renderSubtaskHTML(outputContainer, subtask);
    }
}


/**
 * Renders the HTML code for a subtask and appends it to the output container.
 *
 * @param {HTMLElement} outputContainer - The container element where the subtask HTML will be appended.
 * @param {Object} subtask - The subtask object containing the subtask information.
 */
function renderSubtaskHTML(outputContainer, subtask){
    outputContainer.innerHTML +=
    /*html*/`
        <div class="subTaskOutputDiv" id="subtask${subtask.id}" ondblclick="editSubtask(${subtask.id})">
        <div class="subtaskText">&#8226; ${subtask.subtaskText}</div>
            <div class="subtaskCheckboxes">
                <div class="subtaskImgDiv pointer" id="subtaskImgEdit" onclick="editSubtask(${subtask.id})"> </div>
                <div class="vLine"></div>
                <div class="subtaskImgDiv pointer" id="subtaskImgDelete" onclick="deleteSubtask(${subtask.id})"> </div>
            </div>
        </div>`
}


/**
 * Updates the HTML content of a subtask container with the HTML code for editing the subtask.
 *
 * @param {number} id - The ID of the subtask to be edited.
 */
function editSubtask(id){
    if (checkIfAnySubtaskIsInEditingMode()) {
        return;
    }
    let subtaskContainer = document.getElementById('subtask' + id);
    let subtask = newTask.subtasks.find(subtask => subtask.id == id);
    subtaskContainer.classList.add("editing")
    subtaskContainer.innerHTML = editSubtaskHTML(subtask);
}


/**
 * Checks if any subtask container has the 'editing' class.
 * This is to prevent other subtasks to be edited.
 *
 * @return {boolean} Returns true if any subtask container has the 'editing' class, otherwise returns false.
 */
function checkIfAnySubtaskIsInEditingMode(){
    let subtaskContainers = document.getElementsByClassName('subTaskOutputDiv');
    for (let i = 0; i < subtaskContainers.length; i++) {
        let subtaskContainer = subtaskContainers[i];
        if (subtaskContainer.classList.contains('editing')) {
            return true;
        }
    }
    return false;
}


/**
 * Generates the HTML code for editing a subtask.
 *
 * @param {Object} subtask - The subtask object to be edited.
 * @return {string} The HTML code for editing the subtask.
 */
function editSubtaskHTML(subtask) {
    return /*html*/`
        <input type="text" id="subtaskEditInputField" value="${subtask.subtaskText}">
        <div class="subtaskCheckboxes">
        <div class="subtaskImgDiv pointer" id="subtaskImgDelete" onclick="deleteSubtask(${subtask.id})"> </div><div class="vLine"></div>
            <div class="subtaskImgDiv pointer" id="subtaskImgAddCheck" onclick="saveEditSubtask(${subtask.id})"> </div>
        </div>`
}


/**
 * Updates the subtask text based on the provided ID.
 *
 * @param {number} id - The ID of the subtask to be updated.
 */
function saveEditSubtask(id){
    let newText = document.getElementById('subtaskEditInputField');
    newTask.subtasks.forEach(subtask => {
        if (subtask.id == id){
            subtask.subtaskText = newText.value;
        }
    })
    renderSubtasks();
}


/**
 * Deletes a subtask from the `newTask.subtasks` array based on the provided `subtaskId`.
 *
 * @param {number} subtaskId - The ID of the subtask to be deleted.
 */
function deleteSubtask(subtaskId){
    newTask.subtasks.forEach((subtask, index) => {
        if (subtask.id == subtaskId){
            newTask.subtasks.splice(index, 1);
        }
    })
    renderSubtasks();
}


/**
 * Returns the background color for a given priority level.
 *
 * @param {string} priority - The priority level ('urgent', 'medium', or 'low').
 * @return {string} The corresponding background color ('red', 'orange', 'green', or 'white').
 */
function getButtonColor(priority) {
    switch (priority) {
        case 'urgent':
            return '#ff3d00';
        case 'medium':
            return '#ffa800';
        case 'low':
            return '#7ae229';
        default:
            return 'white';
    }
}


/**
 * Toggles the visibility of the dropdown content and updates the arrow image based on its current direction.
 */
function renderArrow(arrowContainer, contentContainer){
    let customArrow = document.getElementById(arrowContainer)
    let arrowImg = customArrow.childNodes[1];
    arrowImg.dataset.direction == "down"
    ? arrowImg.dataset.direction = "up"
    : arrowImg.dataset.direction = "down"

    arrowImg.src = `../../assets/img/icon-arrow_dropdown_${arrowImg.dataset.direction}.png`
    document.getElementById(contentContainer).classList.toggle('d-none')
}


/**
 * Renders the test contacts in the dropdown content.
 */
function renderContactsToDropdown(){
    let content = document.getElementById('dropdown-content-assignedTo');
    content.innerHTML = '';
    contacts.forEach(contact => {
        content.innerHTML += /*html*/`<div class="dropdownOption" id="assignedToContact${contact.id}" marked=false onclick="assignContactToTask(${contact.id})">
            <div class="dropdownContactBadgeAndName">${renderAssignedToButtonsHTML(contact)} ${contact.name}</div> <img src="../../assets/img/icon-check_button_unchecked.png" alt="">
            </div>`
    })
}

function addTaskDueDateOpenCalendear(){
    document.getElementById('addTaskDueDateInput').showPicker();
}

/**
 * Assigns a contact to a task based on the provided id.
*
* @param {number} id - The id of the task to assign the contact to.
*/
function assignContactToTask(id){
    let dropdownContact = document.getElementById('assignedToContact' + id);
    let dropdownCheckboxImage = dropdownContact.lastElementChild;

    setDropdownContactAppearance(dropdownContact, dropdownCheckboxImage);
    toggleAssignedContactsContainer();
    pushContactToTempAssignedContacts(id);
    renderAssignedContactsContainer();
}


/**
 * Pushes the given ID to the temporary assigned contacts array if it is not already present.
 * If the ID is already present, it removes it from the array.
 *
 * @param {number} id - The ID to be pushed or removed from the temporary assigned contacts array.
 */
function pushContactToTempAssignedContacts(id){
    if (tempAssignedContacts.indexOf(id) == -1){
        tempAssignedContacts.push(id)
    }else{
        tempAssignedContacts.splice(tempAssignedContacts.indexOf(id), 1)
    }
}


/**
 * Sets the appearance of the dropdown contact based on the 'marked' attribute.
 *
 * @param {Element} dropdownContact - The dropdown contact element to modify.
 * @param {Element} dropdownCheckboxImage - The image element representing the checkbox.
 */
function setDropdownContactAppearance(dropdownContact, dropdownCheckboxImage){
    if (dropdownContact.getAttribute('marked') == 'false'){
        dropdownContact.setAttribute('marked', 'true');
        dropdownCheckboxImage.src = '../../assets/img/icon-check_button_checked_white.png';
    }else{
        dropdownContact.setAttribute('marked', 'false');
        dropdownCheckboxImage.src = '../assets/img/icon-check_button_unchecked.png';
    }
}


/**
 * Toggles the visibility of the assigned contacts container based on the marked attribute of the contact cards.
 */
function toggleAssignedContactsContainer(){
    let contactCards = document.getElementById('dropdown-content-assignedTo').childNodes;
    let assignedContactsContainer = document.getElementById('assignedContactsContainer');
    let empty = true;
    for(let i = 0; i < contactCards.length; i++){
        if(contactCards[i].getAttribute('marked') == 'true'){
            assignedContactsContainer.classList.remove('d-none');
            empty = false;
            break;
        }
    }
    if (empty){
        assignedContactsContainer.classList.add('d-none');
    }
}


/**
 * Renders the assigned contacts container by populating it with the HTML generated by the renderAssignedToButtonsHTML function.
 */
function renderAssignedContactsContainer(){
    let container = document.getElementById('assignedContactsContainer');
    container.innerHTML = '';
    tempAssignedContacts.forEach(id => {
        let contact = contacts.find(contact => contact.id == id);
        container.innerHTML += renderAssignedToButtonsHTML(contact)
    })
}


function chooseCategory(chosenCategory){
    let dropdownContentContainer = document.getElementById('dropdown-content-category')
    let categoryContainer = document.getElementById('dropdown-category-title');
    categoryContainer.innerHTML = chosenCategory;
    dropdownContentContainer.classList.add('d-none');
    setCategory(chosenCategory);
}


/**
 * Sets the value of the global variable "category" to the provided "chosenCategory".
 *
 * @param {string} chosenCategory - The category to set the global variable "category" to..
 */
function setCategory(chosenCategory){
    newTask['type'] = chosenCategory;
}



/**
 * Fetches information for a new card by setting values for id, type, title, description, completed subtasks, assignedTo, category, priority, and due date of a new task.
 */
function collectInformationsForNewCard(){

    // wenn KEINE Karte editiert wird
    if (!checkIfCardIsEditing()){
        newTask.id = getNewTaskId(); 
    }
    newTask.title = getNewTaskTitle();
    newTask.description = getNewTaskDescription();
    newTask.completedSubtasks = getNewTaskCompletedSubtasks();
    newTask.assignedTo = getNewTaskAssignedTo();
    newTask.dueDate = getNewTaskDueDate();
}

/**
 * Retrieves the new task ID based on the length of the tasks array.
 *
 * @return {number} The new task ID.
 */
function getNewTaskId(){
    if (!checkIfCardIsEditing()){
        let freeId = findFreeId(tasks);
        return freeId;
    }
}


function checkIfCardIsEditing(){
    let editing = document.getElementsByTagName('*');
    for (let element of editing){
        if(element.hasAttribute('editing')){
            return true;
        }
    }
    return false;
}


/**
 * Retrieves the value of the input field with the id 'addTaskEnterTitleInput'
 * and returns it as the title of the new task.
 *
 * @return {string} The title of the new task.
 */
function getNewTaskTitle(){
    return document.getElementById('addTaskEnterTitleInput').value
}




/**
 * Retrieves the description of the new task from the 'addTaskDescriptionInput' element.
 *
 * @return {string} The description of the new task.
 */
function getNewTaskDescription(){
    return document.getElementById('addTaskDescriptionInput').value
}


/**
 * Retrieves the new task subtasks from the temporary subtasks array.
 *
 * @return {Array} The subtasks of the new task.
 */
function getNewTaskSubtasks(){
    return tempSubtasks;
}


/**
 * Retrieves the completed subtasks of the new task.
 *
 * @return {Array} An empty array representing the completed subtasks of the new task.
 */

function getNewTaskCompletedSubtasks(){
    return [];
}


/**
 * Retrieves the assigned contacts for the new task.
 *
 * @return {Array} The assigned contacts for the new task.
 */
function getNewTaskAssignedTo(){
    return tempAssignedContacts;
}


/**
 * Retrieves the category of the new task.
 *
 * @return {string} The category of the new task.
 */
function getNewTaskCategory(){
    //TODO: return the right value
    return 'todo';
}


/**
 * Retrieves the value of the 'addTaskDueDateInput' element and returns it as the due date of the new task.
 *
 * @return {string} The due date of the new task.
 */
function getNewTaskDueDate(){
    return document.getElementById('addTaskDueDateInput').value
}

/**
 * Sets the minimum value of the "addTaskDueDateInput" element to the current date.
 */
function setTodayDateAsMin(){
    let date = new Date(),
        day = date.getDate(),
        month = date.getMonth() + 1,
        year = date.getFullYear();

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;

    const todayDate = `${year}-${month}-${day}`;

    document.getElementById("addTaskDueDateInput").setAttribute('min', todayDate)
}


async function createTask(){
    collectInformationsForNewCard();
    tasks.push(newTask);
    await saveTasksToRemoteStorage();
    showSuccessMessage();
}

function checkValidity(){
    requiredInputFields.forEach(requiredInputField => {
        document.getElementById(requiredInputField.id).addEventListener('input', () => {
            toggleRequiredMessage(requiredInputField);
        })
        toggleRequiredMessage(requiredInputField);
    })
}

function toggleRequiredMessage(requiredInputField){
    let requiredMessageField = document.getElementById(requiredInputField.requiredFieldId);
    let toUnderline = document.getElementById(requiredInputField.idForRedUnderline);

    if (getStateOfRequriredField(requiredInputField)){
        requiredInputField.state = true;
        toUnderline.classList.remove('is-invalid');
        requiredMessageField.innerHTML = "";
    } else {
        requiredInputField.state = false;
        toUnderline.classList.add('is-invalid');
        requiredMessageField.innerHTML = "This field is requried";
    }
    setCreateBtnState();
}


function getStateOfRequriredField(requiredInputField){
    let inputField = document.getElementById(requiredInputField.id);
    if (inputField.value == ''){
        inputField.style = 'color: #D1D1D1 !important';
        return false;
    }
    inputField.style = 'color: black !important';
    return true;
}


function setCreateBtnState() {
	if (requiredInputFields.every((r) => r.state == true)) {
        activateButton('createBtn', 'createTask()');
	} else {
        deactivateButton('createBtn');
	}
}


/**
 * Activates a button by removing the "disabled" class and setting the "onclick" attribute.
 *
 * @param {string} id - The ID of the button element.
 * @param {string} onClickFunctionName - The name of the function to be called when the button is clicked.
 */
function activateButton(id, onClickFunctionName){
    if(document.getElementById(id)){
        let btn = document.getElementById(id);
        btn.classList.remove("disabled");
        btn.setAttribute("onclick", onClickFunctionName);
    }
}


/**
 * Deactivates a button by adding the "disabled" class and removing the "onclick" attribute.
 *
 * @param {string} id - The ID of the button element.
 */
function deactivateButton(id){
    if(document.getElementById(id)){
        let btn = document.getElementById(id);
        btn.classList.add("disabled");
        btn.removeAttribute("onclick");
    }
}


//FIXME: Doesn't work due the fact that firebase doesn't save empty arrays as values

// REMOTE STORAGE
async function saveTasksToRemoteStorage(){
   deactivateButton('createBtn');
   await remoteStorageSetItem('tasks', JSON.stringify(tasks))
   // await firebaseUpdateItem(tasks, FIREBASE_TASKS_ID);
   activateButton('createBtn', 'createTask()');
}

async function restoreTasksOnRemoteStorage(){
    // REMOTE STORAGE
    await remoteStorageSetItem('tasks', JSON.stringify(_tasksBackup));
    
    // FIREBASE
    // await remoteStorageSetItem(_tasksBackup, FIREBASE_TASKS_ID);
}

async function loadTasksFromRemoteStorage(){
    tasks = JSON.parse(await remoteStorageGetItem('tasks')) //REMOTE STORAGE
    // tasks = await firebaseGetItem(FIREBASE_TASKS_ID); //FIREBASE
    console.info('Tasks loaded from Remote Storage');
}
