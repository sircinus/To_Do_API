const express = require("express");
const router = express.Router();
const UsersModel = require("../models/users");
const ToDoModel = require("../models/toDoList");
const bcrypt = require("bcrypt");
const passwordCheck = require("../utils/passwordCheck");
const { Op } = require("sequelize");

router.get("/:email", async (req, res) => {
  const email = req.params.email;
  const users = await UsersModel.findOne({ where: { email: email } });
  res.status(200).json({
    name: users.nama,
    metadata: "test user endpoint",
  });
});

router.post("/list", async (req, res) => {
  const toDo = await ToDoModel.findAll();
  res.status(200).json({
    data: toDo,
    metadata: "test all list endpoint",
  });
});

// router.post("/register", async (req, res) => {
//   const { email, nama, password } = req.body;

//   const encryptedPassword = await bcrypt.hash(password, 10);

//   const users = await UsersModel.create({
//     email,
//     nama,
//     password: encryptedPassword,
//   });

//   res.status(200).json({
//     data: users,
//     metadata: "Account Successfully Created",
//   });
// });

router.post("/register", async (req, res) => {
  const { email, nama, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await UsersModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    // If the user doesn't exist, proceed with registration
    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await UsersModel.create({
      email,
      nama,
      password: encryptedPassword,
    });

    res.status(200).json({
      data: newUser,
      metadata: "Account Successfully Created",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

//Login Method Post
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const list = await ToDoModel.findAll({ where: { email: email } });
  const check = await passwordCheck(email, password);

  if (check.compare === true) {
    res.status(200).json({
      metadata: "Login Success",
      user: check.userData,
      tasks: list,
    });
  } else {
    res.status(400).json({
      error: "Incorrect Email Or Password!",
    });
  }
});

router.get("/tasks/:email", async (req, res) => {
  const { email } = req.params;
  const { title } = req.query; // Retrieve the title query parameter

  const existUser = await UsersModel.findOne({ where: { email } });

  if (!existUser) {
    return res.status(400).json({
      error: "Invalid",
    });
  }

  let tasks;
  if (title) {
    // If a title is provided, search tasks by partial match of the title
    tasks = await ToDoModel.findAll({
      where: {
        email,
        taskTitle: {
          [Op.like]: `%${title}%`,
        },
      },
    });
  } else {
    // If no title is provided, fetch all tasks for the user
    tasks = await ToDoModel.findAll({ where: { email } });
  }

  res.status(200).json({
    metadata: "List Of Tasks",
    tasks,
  });
});

router.put("/updateName", async (req, res) => {
  const { email, nama } = req.body;

  try {
    const users = await UsersModel.update(
      {
        nama,
      },
      { where: { email: email } }
    );
    res.status(200).json({
      metadata: "Name Updated👌",
      users,
    });
  } catch (error) {
    res.status(404).json({
      error: "Error, Please Try Again!",
      error,
    });
  }
});

router.put("/update", async (req, res) => {
  const { email, nama, password, passwordBaru } = req.body;
  const check = await passwordCheck(email, password);

  const encryptedPassword = await bcrypt.hash(passwordBaru, 10);

  if (check.compare == true) {
    const users = await UsersModel.update(
      {
        nama,
        password: encryptedPassword,
      },
      { where: { email: email } }
    );
    res.status(200).json({
      users: { updated: users[0] },
      metadata: "User Updated👌",
    });
  } else {
    res.status(404).json({
      error: "Error, Please Try Again!",
    });
  }
});

router.delete("/delete", async (req, res) => {
  const { email, password } = req.body;

  const check = await passwordCheck(email, password);

  if (check.compare == true) {
    const users = await UsersModel.destroy({ where: { email: email } });
    res.status(200).json({
      deleted: users,
      metadata: "User Deleted From Database👌",
    });
  } else {
    res.status(404).json({
      error: "Please Try Again!",
    });
  }
});

router.post("/addTask", async (req, res) => {
  const { email, taskTitle, taskNote, due_date } = req.body;

  const toDo = await ToDoModel.create({
    email: email,
    taskTitle: taskTitle,
    taskNote: taskNote,
    due_date: due_date,
    status: "0",
  });
  console.log(email);
  const list = await ToDoModel.findAll({ where: { email: email } });
  res.status(200).json({
    new_data: toDo,
    task: list,
    metadata: "test to do input task",
  });
});

router.put("/updateTask", async (req, res) => {
  const { email, taskTitle, taskTitleBaru, taskNote, due_date, status } =
    req.body;
  console.log(status);
  const list = await ToDoModel.findAll({ where: { email: email } });

  const toDo = await ToDoModel.update(
    {
      email: email,
      taskTitle: taskTitleBaru,
      taskNote: taskNote,
      due_date: due_date,
      status: status,
    },
    { where: { taskTitle: taskTitle, email: email } }
  );
  res.status(200).json({
    data: { updated: toDo[0] },
    metadata: "Update endpoint",
    task: list,
  });
});

router.delete("/deleteTask", async (req, res) => {
  const { email, taskTitle } = req.body;
  console.log(email);
  console.log(taskTitle);
  const check = await ToDoModel.findOne({
    where: { taskTitle: taskTitle, email: email },
  });

  if (check) {
    const toDo = await ToDoModel.destroy({
      where: { taskTitle: taskTitle, email: email },
    });

    res.status(200).json({
      users: {
        deleted: toDo,
      },
      metadata: "Task Deleted👌",
    });
  } else {
    res.status(404).json({
      error: "Task doesn't exist",
    });
  }
});

module.exports = router;
