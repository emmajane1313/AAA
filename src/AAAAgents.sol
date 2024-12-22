// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.24;

import "./AAAErrors.sol";
import "./AAALibrary.sol";
import "./AAAAccessControls.sol";
import "./AAADevTreasury.sol";

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
    event BalanceAdded(
        address token,
        uint256 agentId,
        uint256 amount,
        uint256 collectionId
    );
    event BalanceWithdrawn(
        address token,
        uint256 agentId,
        uint256 amount,
        uint256 collectionId
    );

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

        emit BalanceAdded(token, agentId, amount, collectionId);
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

        emit BalanceWithdrawn(token, agentId, amount, collectionId);
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
