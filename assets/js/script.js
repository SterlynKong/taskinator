// variable to find and hold DOM element page-content
var pageContentEl = document.querySelector("#page-content");

// create unique id for each task
var taskIdCounter = 0;

// variable to find and hold the DOM element 'tasks-to-do' list for manipulation
var tasksToDoEl = document.querySelector("#tasks-to-do");

// variabe to find and hold the DOM element 'tasks-in-progress' list for manipulation
var tasksInProgressEl = document.querySelector("#tasks-in-progress");

// variabe to find and hold the DOM element 'tasks-completed' list for manipulation
var tasksCompletedEl = document.querySelector("#tasks-completed");

// variable to find and hold the DOM element 'task-form' for manipulation 
var formEl = document.querySelector("#task-form");

// variable to hold task data as objects
var tasks = [];

// function to capture form input and use it to create an object (passed to the createTask function)
var taskFormHandler = function () {
    event.preventDefault();

    var taskNameInput = document.querySelector("input[name='task-name']").value;
    var taskTypeInput = document.querySelector("select[name='task-type']").value;

    // check if input values are empty strings
    if (!taskNameInput || !taskTypeInput) {
        alert("You need to fill out the task form!");
        return false;
    }

    // reset form elemnet after submit
    formEl.reset();

    var isEdit = formEl.hasAttribute("data-task-id");

    // has data attribute, so get task id and call function to complete edit process
    if (isEdit) {
        var taskId = formEl.getAttribute("data-task-id");
        completeEditTask(taskNameInput, taskTypeInput, taskId);
    }
    // no data attribute, so create object as normal and pass to createTaskEl function
    else {
        var taskDataObj = {
            name: taskNameInput,
            type: taskTypeInput,
            status: "to do"
        }

        createTaskEl(taskDataObj);
    }
};


// function to create a new task and place in correct list
var createTaskEl = function (taskDataObj) {
    // create list item
    var listItemEl = document.createElement("li");
    listItemEl.className = "task-item";

    // add task id as a custom attribute
    listItemEl.setAttribute("data-task-id", taskIdCounter);

    // make task draggable
    listItemEl.setAttribute("draggable", "true");

    // create div to hold task info and add to list item
    var taskInfoEl = document.createElement("div");
    // give it a class name
    taskInfoEl.className = "task-info";
    //add html content to div
    taskInfoEl.innerHTML = "<h3 class='task-name'>" + taskDataObj.name + "</h3><span class='task-type'>" + taskDataObj.type + "</span>";
    listItemEl.appendChild(taskInfoEl);

    // define and add id attribute of task as current taskIdCounter
    taskDataObj.id = taskIdCounter;

    // append task object currently being processed to end of tasks array
    tasks.push(taskDataObj);

    // save new task to localStorage
    saveTasks();

    // call createTaskActions function to create and append taskActions to this task
    var taskActionsEl = createTaskActions(taskIdCounter);
    listItemEl.appendChild(taskActionsEl);

    // check which list task should be placed in based on its status
    if (taskDataObj.status === "to do") {
        // add entire list item to 'to do' list
        tasksToDoEl.appendChild(listItemEl);
    }
    else if (taskDataObj.status === "in progress") {
        // add entire list item to 'in progress' list
        taskStatus = "in progress";
        listItemEl.querySelector("select[name='status-change']").value = taskStatus;
        tasksInProgressEl.appendChild(listItemEl);
    }
    else if (taskDataObj.status === "completed") {
        tasksCompletedEl.appendChild(listItemEl);
    }    

    // increase task counter for next unique id
    taskIdCounter++;
};


var createTaskActions = function (taskId) {
    // create container to hold task action buttons
    var actionContainerEl = document.createElement("div");
    actionContainerEl.className = "task-actions";

    // create edit button
    var editButtonEl = document.createElement("button");
    editButtonEl.textContent = "Edit";
    editButtonEl.className = "btn edit-btn";
    editButtonEl.setAttribute("data-task-id", taskId);

    // add edit button to actionContainerEl  
    actionContainerEl.appendChild(editButtonEl);

    // create delete button
    var deleteButtonEl = document.createElement("button");
    deleteButtonEl.textContent = "Delete";
    deleteButtonEl.className = "btn delete-btn";
    deleteButtonEl.setAttribute("data-task-id", taskId);

    // add delete button to actionContainerEl  
    actionContainerEl.appendChild(deleteButtonEl);

    // create status selector
    var statusSelectEl = document.createElement("select");
    statusSelectEl.className = "select-status";
    statusSelectEl.setAttribute("name", "status-change");
    statusSelectEl.setAttribute("data-task-id", taskId);

    // array of status selector options
    var statusChoices = ["To Do", "In Progress", "Completed"];
    // iterate through options array and create options matching items found at each index and append them to statusSelectEL
    for (var i = 0; i < statusChoices.length; i++) {
        // create option element
        var statusOptionEl = document.createElement("option");
        statusOptionEl.textContent = statusChoices[i];
        statusOptionEl.setAttribute("value", statusChoices[i]);

        // append to select
        statusSelectEl.appendChild(statusOptionEl);
    }
    // add status selector to actionContainerEl
    actionContainerEl.appendChild(statusSelectEl);

    return actionContainerEl;
};


formEl.addEventListener("submit", taskFormHandler);

var taskButtonHandler = function (event) {
    // get target element from event
    var targetEl = event.target;

    // edit button was clicked
    if (targetEl.matches(".edit-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        editTask(taskId);
    }
    // delete button was clicked
    else if (targetEl.matches(".delete-btn")) {
        var taskId = targetEl.getAttribute("data-task-id");
        deleteTask(taskId);
    }
};


var editTask = function (taskId) {
    // get task list item element
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // get content from task name and type
    var taskName = taskSelected.querySelector("h3.task-name").textContent;
    var taskType = taskSelected.querySelector("span.task-type").textContent;

    // set form fields to data retreived from the selected task name and type
    document.querySelector("input[name='task-name']").value = taskName;
    document.querySelector("select[name='task-type']").value = taskType;

    // set the button text to 'edit' to notify user of EDIT MODE
    document.querySelector("#save-task").textContent = "Save Task";

    // save id of task selected for editing
    formEl.setAttribute("data-task-id", taskId);
};


var deleteTask = function (taskId) {
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");
    taskSelected.remove();

    // create new array to hold updated list of tasks
    var updatedTaskArr = [];

    // loop through current tasks
    for (var i = 0; i < tasks.length; i++) {
        // if tasks[i].id doesn't match the value of taskId, let's keep that task and push it into the new array
        if (tasks[i].id !== parseInt(taskId)) {
            updatedTaskArr.push(tasks[i]);
        }
    }

    // reassign tasks array to be the same as updatedTaskArr
    tasks = updatedTaskArr;

    // save task to localStorage
    saveTasks();
};


var completeEditTask = function (taskName, taskType, taskId) {
    // find the matching task list item
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // set new values
    taskSelected.querySelector("h3.task-name").textContent = taskName;
    taskSelected.querySelector("span.task-type").textContent = taskType;

    // loop through tasks array and task object with new content
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].name = taskName;
            tasks[i].type = taskType;
        }
    };

    // save task to localStorage
    saveTasks();

    // advise user that task has been updated
    alert("Task Updated!");

    // reset form to default, ready for user to add new tasks
    formEl.removeAttribute("data-task-id");
    document.querySelector("#save-task").textContent = "Add Task";
};


var taskStatusChangeHandler = function (event) {
    // get the task item's id
    var taskId = event.target.getAttribute("data-task-id");

    // get the currently selected option's value and convert to lowercase
    var statusValue = event.target.value.toLowerCase();

    // find the parent task item element based on the id
    var taskSelected = document.querySelector(".task-item[data-task-id='" + taskId + "']");

    // determine where to place changed task based on selected status value
    if (statusValue === "to do") {
        tasksToDoEl.appendChild(taskSelected);
    }
    else if (statusValue === "in progress") {
        tasksInProgressEl.appendChild(taskSelected);
    }
    else if (statusValue === "completed") {
        tasksCompletedEl.appendChild(taskSelected);
    }

    // update task's in tasks array
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(taskId)) {
            tasks[i].status = statusValue;
        }
    }
    // save task to localStorage
    saveTasks();
};


var dragTaskHandler = function (event) {
    var taskId = event.target.getAttribute("data-task-id");
    event.dataTransfer.setData("text/plain", taskId);
    var getId = event.dataTransfer.getData("text/plain");
};


var dropZoneDragHandler = function (event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        event.preventDefault();
        taskListEl.setAttribute("style", "background: rgba(68, 233, 255, 0.7); border-style: dashed;");
    }
};


var dragLeaveHandler = function (event) {
    var taskListEl = event.target.closest(".task-list");
    if (taskListEl) {
        taskListEl.removeAttribute("style");
    }
}


var dropTaskHandler = function (event) {
    // retrieve the task id previously stored in the dataTransfer attribute and save it as id
    var id = event.dataTransfer.getData("text/plain");
    // variable to define the draggable element that matches the id retreived from the dataTransfer attribute
    var draggableElement = document.querySelector("[data-task-id='" + id + "']");
    // variable to define the element that matches the .task-list attribute in the target
    var dropZoneEl = event.target.closest(".task-list");
    // variabe to define status of dragged task element after dropping by getting the id of the dropZoneEl
    var statusType = dropZoneEl.id;
    // set status of task based on dropZone id
    var statusSelectEl = draggableElement.querySelector("select[name='status-change']");
    if (statusType === "tasks-to-do") {
        statusSelectEl.selectedIndex = 0;
    }
    else if (statusType === "tasks-in-progress") {
        statusSelectEl.selectedIndex = 1;
    }
    else if (statusType === "tasks-completed") {
        statusSelectEl.selectedIndex = 2;
    }
    dropZoneEl.removeAttribute("style");
    // append draggableElement to the dropZoneEL
    dropZoneEl.appendChild(draggableElement);

    // loop through tasks array to find and update the updated task's status
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === parseInt(id)) {
            tasks[i].status = statusSelectEl.value.toLowerCase();
        }
    }
    // save task to localStorage
    saveTasks();
};


// save tasks
var saveTasks = function () {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


var loadTasks = function () {
    var savedTasks = localStorage.getItem("tasks");

    // if noting is retrieved from local storage return false
    if (!savedTasks) {
        return false;
    }
    savedTasks = JSON.parse(savedTasks);

    // loop through savedTasks array
    for (var i = 0; i < savedTasks.length; i++) {
        // pass each task object into the `createTaskEl()` function
        createTaskEl(savedTasks[i]);
    }
};

loadTasks();

// listen for click on the page-content element and call taskButtonhandler function
pageContentEl.addEventListener("click", taskButtonHandler);

// listen for change event on the page-content element and call the taskStatusChangeHandler fucntion
pageContentEl.addEventListener("change", taskStatusChangeHandler);

// listen for dragastart event on page-content element and call function dragTaskhandler
pageContentEl.addEventListener("dragstart", dragTaskHandler);

// listen for dragover event on page-content element and call fucntion dropZoneHandler
pageContentEl.addEventListener("dragover", dropZoneDragHandler);

// listen for drop event on page-content element and call function dropTaskHandler
pageContentEl.addEventListener("drop", dropTaskHandler);

// listen for dragleave events on page-content element and call function dragLeaveHandler
pageContentEl.addEventListener("dragleave", dragLeaveHandler);