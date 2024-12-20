// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "./AAAErrors.sol";

contract AAAAccessControls {
    mapping(address => bool) public admins;
    mapping(address => bool) public agents;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);

    modifier onlyAdmin() {
        require(admins[msg.sender], "Not an admin");
        _;
    }

    constructor() {
        admins[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    function addAdmin(address _admin) external onlyAdmin {
        if (admins[_admin]) {
            revert AAAErrors.AdminAlreadyExists();
        }
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    function removeAdmin(address _admin) external onlyAdmin {
        if (!admins[_admin]) {
            revert AAAErrors.AdminDoesntExist();
        }

        if (_admin == msg.sender) {
            revert AAAErrors.CannotRemoveSelf();
        }

        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    function addAgent(address _agent) external onlyAdmin {
        if (agents[_agent]) {
            revert AAAErrors.AgentAlreadyExists();
        }
        agents[_agent] = true;
        emit AgentAdded(_agent);
    }

    function removeAgent(address _agent) external onlyAdmin {
        if (!agents[_agent]) {
            revert AAAErrors.AgentDoesntExist();
        }
        agents[_agent] = false;
        emit AgentRemoved(_agent);
    }

    function isAdmin(address _address) external view returns (bool) {
        return admins[_address];
    }

    function isAgent(address _address) external view returns (bool) {
        return agents[_address];
    }
}
