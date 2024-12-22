// SPDX-License-Identifier: UNLICENSE
pragma solidity =0.8.24 ^0.8.20;

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.1.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

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

// src/AAALibrary.sol

contract AAALibrary {
    struct Collection {
        address[] erc20Tokens;
        uint256[] prices;
        uint256[] agentIds;
        uint256[] tokenIds;
        string metadata;
        address artist;
        uint256 id;
        uint256 dropId;
        uint256 amount;
        uint256 amountSold;
    }

    struct Drop {
        uint256[] collectionIds;
        string metadata;
        address artist;
        uint256 id;
    }

    struct CollectionInput {
        address[] tokens;
        uint256[] prices;
        uint256[] agentIds;
        string metadata;
        uint256 amount;
    }

    struct Agent {
        uint256[] collectionIdsHistory;
        string metadata;
        address wallet;
        uint256 id;
    }

    struct Order {
        uint256[] mintedTokens;
        uint256 collectionId;
        address token;
        uint256 amount;
        uint256 totalPrice;
        uint256 id;
    }
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

// src/AAADevTreasury.sol

contract AAADevTreasury {
    AAAAccessControls public accessControls;
    AAAAgents public agents;
    address public market;
    mapping(address => uint256) private _balance;

    modifier onlyAdmin() {
        if (!accessControls.isAdmin(msg.sender)) {
            revert AAAErrors.NotAdmin();
        }
        _;
    }

    event FundsReceived(
        address indexed buyer,
        address indexed token,
        uint256 amount
    );
    event FundsWithdrawn(address indexed token, uint256 amount);
    event AgentFundsWithdrawn(
        address indexed agent,
        address indexed token,
        uint256 amount
    );

    constructor(address _accessControls) payable {
        accessControls = AAAAccessControls(_accessControls);
    }

    function receiveFunds(
        address buyer,
        address paymentToken,
        uint256 amount
    ) external {
        if (msg.sender != market) {
            revert AAAErrors.OnlyMarketContract();
        }
        _balance[paymentToken] += amount;

        emit FundsReceived(buyer, paymentToken, amount);
    }

    function withdrawFunds(address token, uint256 amount) external onlyAdmin {
        IERC20(token).transferFrom(address(this), msg.sender, amount);

        _balance[token] -= amount;

        emit FundsWithdrawn(token, amount);
    }

    function withdrawAgentFunds(
        address token,
        uint256 agentId,
        uint256 amount,
        uint256 collectionId
    ) external {
        if (msg.sender != address(agents)) {
            revert AAAErrors.OnlyAgentsContract();
        }
        if (
            agents.getAgentActiveBalance(token, agentId, collectionId) >= amount
        ) {
            revert AAAErrors.InvalidAmount();
        }

        IERC20(token).transferFrom(address(this), msg.sender, amount);

        _balance[token] -= amount;

        emit AgentFundsWithdrawn(agents.getAgentWallet(agentId), token, amount);
    }

    function setAccessControls(address _accessControls) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }

    function setAgents(address _agents) external onlyAdmin {
        agents = AAAAgents(_agents);
    }

    function setMarket(address _market) external onlyAdmin {
        market = _market;
    }
}

// src/AAAAgents.sol

contract AAAAgents {
    uint256 private _agentCounter;
    address public market;
    AAAAccessControls public accessControls;
    AAADevTreasury public devTreasury;
    mapping(uint256 => AAALibrary.Agent) private _agents;
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        private _agentActiveBalances;
    mapping(uint256 => mapping(address => mapping(uint256 => uint256)))
        private _agentTotalBalances;

    event AgentCreated(address wallet, address creator, uint256 indexed id);
    event AgentDeleted(uint256 indexed id);
    event AgentEdited(uint256 indexed id);
    event BalanceAdded(address token, uint256 agentId, uint256 amount);
    event BalanceWithdrawn(address token, uint256 agentId, uint256 amount);

    modifier onlyAdmin() {
        if (!accessControls.isAdmin(msg.sender)) {
            revert AAAErrors.NotAdmin();
        }
        _;
    }

    modifier onlyMarket() {
        if (market != msg.sender) {
            revert AAAErrors.OnlyMarketContract();
        }
        _;
    }

    constructor(address _accessControls, address _devTreasury) payable {
        accessControls = AAAAccessControls(_accessControls);
        devTreasury = AAADevTreasury(_devTreasury);
    }

    function createAgent(
        string memory metadata,
        address wallet
    ) external onlyAdmin {
        _agentCounter++;

        _agents[_agentCounter] = AAALibrary.Agent({
            id: _agentCounter,
            metadata: metadata,
            wallet: wallet,
            collectionIdsHistory: new uint256[](0)
        });

        accessControls.addAgent(wallet);

        emit AgentCreated(wallet, msg.sender, _agentCounter);
    }

    function editAgent(
        string memory metadata,
        address wallet,
        uint256 agentId
    ) external onlyAdmin {
        _agents[agentId] = AAALibrary.Agent({
            id: agentId,
            metadata: metadata,
            wallet: wallet,
            collectionIdsHistory: _agents[agentId].collectionIdsHistory
        });

        emit AgentEdited(_agentCounter);
    }

    function deleteAgent(uint256 agentId) external onlyAdmin {
        accessControls.removeAgent(_agents[agentId].wallet);
        delete _agents[agentId];

        emit AgentDeleted(_agentCounter);
    }

    function addBalance(
        address token,
        uint256 agentId,
        uint256 amount,
        uint256 collectionId
    ) external onlyMarket {
        _agentActiveBalances[agentId][token][collectionId] += amount;
        _agentTotalBalances[agentId][token][collectionId] += amount;
        _agents[agentId].collectionIdsHistory.push(collectionId);

        emit BalanceAdded(token, agentId, amount);
    }

    function withdrawBalance(
        address token,
        uint256 agentId,
        uint256 amount,
        uint256 collectionId
    ) external {
        if (
            !accessControls.isAgent(msg.sender) ||
            _agents[agentId].wallet != msg.sender
        ) {
            revert AAAErrors.NotAgent();
        }

        if (_agentActiveBalances[agentId][token][collectionId] >= amount) {
            revert AAAErrors.InsufficientBalance();
        }

        devTreasury.withdrawAgentFunds(token, agentId, amount, collectionId);

        _agentActiveBalances[agentId][token][collectionId] -= amount;

        emit BalanceWithdrawn(token, agentId, amount);
    }

    function getAgentCounter() public view returns (uint256) {
        return _agentCounter;
    }

    function getAgentWallet(uint256 agentId) public view returns (address) {
        return _agents[agentId].wallet;
    }

    function getAgentMetadata(
        uint256 agentId
    ) public view returns (string memory) {
        return _agents[agentId].metadata;
    }

    function getAgentActiveBalance(
        address token,
        uint256 agentId,
        uint256 collectionId
    ) public view returns (uint256) {
        return _agentActiveBalances[agentId][token][collectionId];
    }

    function getAgentTotalBalance(
        address token,
        uint256 agentId,
        uint256 collectionId
    ) public view returns (uint256) {
        return _agentTotalBalances[agentId][token][collectionId];
    }

    function getAgentCollectionIdsHistory(
        uint256 agentId
    ) public view returns (uint256[] memory) {
        return _agents[agentId].collectionIdsHistory;
    }

    function setAccessControls(address _accessControls) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }

    function setDevTreasury(address _devTreasury) external onlyAdmin {
        devTreasury = AAADevTreasury(_devTreasury);
    }

    function setMarket(address _market) external onlyAdmin {
        market = _market;
    }
}
