import React, { Component } from 'react';
import { List, fromJS } from 'immutable';
import rp from 'request-promise';

import logo from './logo.svg';
import './App.css';

/**
  TODO:
  - Style
  - Add fetching spinner and an error page/message when data is not received
*/
class App extends Component {
  state = {

    // list of users with names and emails
    users: List(),

    // list of boolean to manage the state of the checkboxes
    isSelected: List()
  }

  /** Transform data received from API to store in state */
  reduceUsers = (users) => {
    const sortedUsers = users
      // Only get name and email
      .map(user => ({
        name: user.name,
        email: user.email
      }))
      // Sort by name
      .sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });

    return fromJS(sortedUsers);
  }

  componentWillMount() {
    rp({
        uri: 'https://jsonplaceholder.typicode.com/users',
        json: true
    })
    .then(response => {
      this.setState({
        users: this.reduceUsers(response),

        // Initialize this array to have the same length as users and all false
        isSelected: fromJS(Array(response.length).fill(false))
      });
    })
    .catch(err => {
      console.log('Unable to get user data!', err);
    });
  }

  /** Handler to pass to the checkboxes */
  onToggleSelected = (i) => {
    this.setState(({ isSelected }) => ({
      isSelected: isSelected.update(i, v => !v)
    }));
  }

  /** onConfirm button handler */
  onConfirm = () => {
    const { users, isSelected } = this.state;

    // Log all the selected users' names
    console.log(users
      .filter((user, i) => isSelected.get(i))
      .map(user => user.get('name'))
      .toJS()
    );
  }

  onSelectAll = () => {
    this.setState(({ isSelected }) => ({
      isSelected: isSelected.map(s => true)
    }));
  }

  onUnselectAll = () => {
    this.setState(({ isSelected }) => ({
      isSelected: isSelected.map(s => false)
    }));
  }

  render() {
    const { users, isSelected } = this.state;

    const selectedCount = isSelected ? isSelected.filter(v => v).size : 0;
    const aggregations = selectedCount ? (
      <p>{`${selectedCount} of ${isSelected.size} selected`}</p>
    ) : null;

    const userList = users && (
      <ul className="list-group">
        {users.map((user, i) => (
          <UserItem
            key={i}
            id={i}
            isSelected={isSelected.get(i)}
            name={user.get('name')}
            email={user.get('email')}
            onChange={this.onToggleSelected}
          />
        ))}
      </ul>
    );

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {aggregations}
          <button className="btn btn-success" onClick={this.onSelectAll}>Select All</button>
          <button className="btn btn-danger" onClick={this.onUnselectAll}>Unselect All</button>
        </div>
        <div className="App-intro">
          {userList}
          <button className="btn btn-default" onClick={this.onConfirm}>Confirm</button>
        </div>
      </div>
    );
  }
}

/** List item that displays user name, user email, and a checkbox */
class UserItem extends Component {
  onChange = () => {
    const { onChange, id } = this.props;
    onChange(id);
  }

  render() {
    const { isSelected, name, email } = this.props;

    return (
      <li className="list-group-item">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={this.onChange}
        />
        <div>
          <p>{name}</p>
          <p>{email}</p>
        </div>
      </li>
    );
  }
}

export default App;
