import React, { Component } from 'react';
import { List, fromJS } from 'immutable';
import rp from 'request-promise';

/**
  TODO:
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

  render() {
    const { users, isSelected } = this.state;

    const selectedCount = isSelected ? isSelected.filter(v => v).size : 0;
    const aggregations = selectedCount ? (
      <div>{`${selectedCount} of ${isSelected.size} selected`}</div>
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
      <div className="col-xs-12" style={{ fontSize: 'large', padding: '20px' }}>
        {aggregations}
        {userList}
        <button
          className="btn btn-default"
          onClick={this.onConfirm}
          style={{
            backgroundColor: '#7CCBD3',
            borderRadius: 0
          }}
        >
          Confirm
        </button>
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
      <li
        className="list-group-item row"
        style={{
          display: 'flex',
          borderStyle: 'solid',
          margin: '5px 0',
          padding: 0
        }}
      >
        <div
          className="col-xs-2"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

            backgroundColor: '#D9D9D9'
          }}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={this.onChange}
          />
        </div>
        <div
          className="col-xs-10"
          style={{
            padding: 0
          }}
        >
          <div
            style={{
              padding: '5px',
              backgroundColor: '#E9E9E9'
            }}
          >
            {name}
          </div>
          <div
            style={{
              padding: '5px 5px 15px 5px'
            }}
          >
            {email}
          </div>
        </div>
      </li>
    );
  }
}

export default App;
