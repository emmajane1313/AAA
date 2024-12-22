// SPDX-License-Identifier: UNLICENSE
pragma solidity =0.8.24;

// src/AAAErrors.sol

contract AAAErrors {
    error NotAdmin();
    error AlreadyAdmin();
    error CannotRemoveSelf();
    error AgentDoesntExist();
    error AdminDoesntExist();
    error AdminAlreadyExists();
    error AgentAlreadyExists();
    error OnlyAgentContract();
    error TokenAlreadyExists();
    error TokenDoesntExist();

    error DropInvalid();

    error OnlyMarketContract();
    error ZeroAddress();
    error InvalidAmount();
    error NotArtist();
    error CantDeleteSoldCollection();

    error NotAvailable();
    error TokenNotAccepted();
    error PaymentFailed();

    error OnlyAgentsContract();

    error NotAgent();
    error InsufficientBalance();
}

// src/AAAAccessControls.sol

contract AAAAccessControls {
    address public agentsContract;
    mapping(address => bool) private _admins;
    mapping(address => bool) private _agents;
    mapping(address => uint256) private _thresholds;
    mapping(address => bool) private _acceptedTokens;

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);
    event AgentAdded(address indexed agent);
    event AgentRemoved(address indexed agent);
    event AcceptedTokenSet(address token);
    event AcceptedTokenRemoved(address token);
    event TokenThresholdSet(address token, uint256 threshold);

    modifier onlyAdmin() {
        if (!_admins[msg.sender]) {
            revert AAAErrors.NotAdmin();
        }
        _;
    }

    modifier onlyAgentContract() {
        if (msg.sender != agentsContract) {
            revert AAAErrors.OnlyAgentContract();
        }
        _;
    }

    constructor() payable {
        _admins[msg.sender] = true;
        emit AdminAdded(msg.sender);
    }

    function addAdmin(address admin) external onlyAdmin {
        if (_admins[admin]) {
            revert AAAErrors.AdminAlreadyExists();
        }
        _admins[admin] = true;
        emit AdminAdded(admin);
    }

    function removeAdmin(address admin) external onlyAdmin {
        if (!_admins[admin]) {
            revert AAAErrors.AdminDoesntExist();
        }

        if (admin == msg.sender) {
            revert AAAErrors.CannotRemoveSelf();
        }

        _admins[admin] = false;
        emit AdminRemoved(admin);
    }

    function addAgent(address agent) external onlyAgentContract {
        if (_agents[agent]) {
            revert AAAErrors.AgentAlreadyExists();
        }
        _agents[agent] = true;
        emit AgentAdded(agent);
    }

    function removeAgent(address agent) external onlyAgentContract {
        if (!_agents[agent]) {
            revert AAAErrors.AgentDoesntExist();
        }
        _agents[agent] = false;
        emit AgentRemoved(agent);
    }

    function setAcceptedToken(address token) external {
        if (_acceptedTokens[token]) {
            revert AAAErrors.TokenAlreadyExists();
        }

        _acceptedTokens[token] = true;

        emit AcceptedTokenSet(token);
    }

    function setTokenThreshold(address token, uint256 threshold) external {
        if (!_acceptedTokens[token]) {
            revert AAAErrors.TokenNotAccepted();
        }

        _thresholds[token] = threshold;

        emit TokenThresholdSet(token, threshold);
    }

    function removeAcceptedToken(address token) external {
        if (!_acceptedTokens[token]) {
            revert AAAErrors.TokenDoesntExist();
        }

        delete _acceptedTokens[token];
        delete _thresholds[token];

        emit AcceptedTokenRemoved(token);
    }

    function isAdmin(address _address) public view returns (bool) {
        return _admins[_address];
    }

    function isAgent(address _address) public view returns (bool) {
        return _agents[_address];
    }

    function isAcceptedToken(address token) public view returns (bool) {
        return _acceptedTokens[token];
    }

    function getTokenThreshold(address token) public view returns (uint256) {
        return _thresholds[token];
    }

    function setAgentsContract(address _agentsContract) public onlyAdmin {
        agentsContract = _agentsContract;
    }
}
