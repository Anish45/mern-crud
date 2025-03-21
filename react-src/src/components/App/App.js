import React, { Component } from "react";
import { Container, Input } from "semantic-ui-react"; // Import Input from Semantic UI
import axios from "axios";
import io from "socket.io-client";

import TableUser from "../TableUser/TableUser";
import ModalUser from "../ModalUser/ModalUser";

import logo from "../../mern-logo.png";
import shirts from "../../shirts.png";
import "./App.css";

class App extends Component {
  constructor() {
    super();

    this.server = process.env.REACT_APP_API_URL || "";
    this.socket = io(this.server);

    this.state = {
      users: [],
      online: 0,
      searchQuery: "", // Add searchQuery state
    };

    this.fetchUsers = this.fetchUsers.bind(this);
    this.handleUserAdded = this.handleUserAdded.bind(this);
    this.handleUserUpdated = this.handleUserUpdated.bind(this);
    this.handleUserDeleted = this.handleUserDeleted.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this); // Bind search handler
  }

  // Fetch data from the back-end
  fetchUsers() {
    axios
      .get(`${this.server}/api/users/`)
      .then((response) => {
        this.setState({ users: response.data });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Handle user added
  handleUserAdded(user) {
    let users = this.state.users.slice();
    users.push(user);
    this.setState({ users: users });
  }

  // Handle user updated
  handleUserUpdated(user) {
    let users = this.state.users.slice();
    let i = users.findIndex((u) => u._id === user._id);
    if (users.length > i) {
      users[i] = user;
    }
    this.setState({ users: users });
  }

  // Handle user deleted
  handleUserDeleted(user) {
    let users = this.state.users.slice();
    users = users.filter((u) => {
      return u._id !== user._id;
    });
    this.setState({ users: users });
  }

  // Handle search input change
  handleSearchChange(event) {
    this.setState({ searchQuery: event.target.value });
  }

  // Filter users based on search query
  getFilteredUsers() {
    const { users, searchQuery } = this.state;
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by name
    );
  }

  // Place socket.io code inside here
  componentDidMount() {
    this.fetchUsers();
    this.socket.on("visitor enters", (data) => this.setState({ online: data }));
    this.socket.on("visitor exits", (data) => this.setState({ online: data }));
    this.socket.on("add", (data) => this.handleUserAdded(data));
    this.socket.on("update", (data) => this.handleUserUpdated(data));
    this.socket.on("delete", (data) => this.handleUserDeleted(data));
  }

  render() {
    let peopleOnline = this.state.online - 1;
    let onlineText = "";

    if (peopleOnline < 1) {
      onlineText = "No one else is online";
    } else {
      onlineText =
        peopleOnline > 1
          ? `${this.state.online - 1} people are online`
          : `${this.state.online - 1} person is online`;
    }

    // Get filtered users
    const filteredUsers = this.getFilteredUsers();

    return (
      <div>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <h1 className="App-intro">MERN CRUD</h1>
            <p>
              A simple records system using MongoDB, Express.js, React.js, and
              Node.js. REST API was implemented on the back-end.
              <br />
              CREATE, READ, UPDATE, and DELETE operations are updated in
              real-time to online users using Socket.io.
            </p>
            <a
              className="shirts"
              href="https://www.teepublic.com/en-au/user/codeweario/albums/4812-tech-stacks"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={shirts} alt="Buy MERN Shirts" />
              <br />
              Buy MERN Shirts
            </a>
          </div>
        </div>
        <Container>
          <ModalUser
            headerTitle="Add User"
            buttonTriggerTitle="Add New"
            buttonSubmitTitle="Add"
            buttonColor="green"
            onUserAdded={this.handleUserAdded}
            server={this.server}
            socket={this.socket}
          />
          {/* Add Search Input */}
          <Input
            icon="search"
            placeholder="Search users..."
            value={this.state.searchQuery}
            onChange={this.handleSearchChange}
            style={{ marginBottom: "20px", width: "100%" }}
          />
          <em id="online">{onlineText}</em>
          <TableUser
            onUserUpdated={this.handleUserUpdated}
            onUserDeleted={this.handleUserDeleted}
            users={filteredUsers} // Pass filtered users
            server={this.server}
            socket={this.socket}
          />
        </Container>
        <br />
      </div>
    );
  }
}

export default App;
