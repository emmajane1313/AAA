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

    event AgentCreated(address[] wallets, address creator, uint256 indexed id);
    event AgentDeleted(uint256 indexed id);
    event AgentEdited(uint256 indexed id);
    event BalanceAdded(
        address token,
        uint256 agentId,
        uint256 amount,
        uint256 collectionId
    );
    event BalanceWithdrawn(
        address[] tokens,
        uint256[] collectionIds,
        uint256[] amounts,
        uint256 agentId
    );

    modifier onlyAdmin() {
        if (!accessControls.isAdmin(msg.sender)) {
            revert AAAErrors.NotAdmin();
        }
        _;
    }

    modifier onlyAgentOwner(uint256 agentId) {
        if (_agents[agentId].owner != msg.sender) {
            revert AAAErrors.NotAgentOwner();
        }
        _;
    }

    modifier onlyMarket() {
        if (market != msg.sender) {
            revert AAAErrors.OnlyMarketContract();
        }
        _;
    }

    constructor(address payable _accessControls, address _devTreasury) payable {
        accessControls = AAAAccessControls(_accessControls);
        devTreasury = AAADevTreasury(_devTreasury);
    }

    function createAgent(
        address[] memory wallets,
        string memory metadata
    ) external {
        _agentCounter++;

        _agents[_agentCounter] = AAALibrary.Agent({
            id: _agentCounter,
            metadata: metadata,
            wallets: wallets,
            owner: msg.sender,
            collectionIdsHistory: new uint256[](0),
            activeCollectionIds: new uint256[](0)
        });

        for (uint256 i = 0; i < wallets.length; i++) {
            accessControls.addAgent(wallets[i]);
        }

        emit AgentCreated(wallets, msg.sender, _agentCounter);
    }

    function editAgent(
        address[] memory wallets,
        string memory metadata,
        uint256 agentId
    ) external onlyAgentOwner(agentId) {
        _agents[agentId] = AAALibrary.Agent({
            id: agentId,
            metadata: metadata,
            wallets: wallets,
            owner: msg.sender,
            collectionIdsHistory: _agents[agentId].collectionIdsHistory,
            activeCollectionIds: _agents[agentId].activeCollectionIds
        });

        emit AgentEdited(_agentCounter);
    }

    function deleteAgent(uint256 agentId) external onlyAgentOwner(agentId) {
        if (_agents[agentId].activeCollectionIds.length > 0) {
            revert AAAErrors.AgentStillActive();
        }

        for (uint256 i = 0; i < _agents[agentId].wallets.length; i++) {
            accessControls.removeAgent(_agents[agentId].wallets[i]);
        }

        delete _agents[agentId];

        emit AgentDeleted(_agentCounter);
    }

    function addBalance(
        address token,
        uint256 agentId,
        uint256 amount,
        uint256 collectionId,
        bool soldOut
    ) external onlyMarket {
        _agentActiveBalances[agentId][token][collectionId] += amount;
        _agentTotalBalances[agentId][token][collectionId] += amount;
        _agents[agentId].collectionIdsHistory.push(collectionId);

        uint256[] storage activeCollections = _agents[agentId]
            .activeCollectionIds;

        bool isCollectionActive = false;
        for (uint256 i = 0; i < activeCollections.length; i++) {
            if (activeCollections[i] == collectionId) {
                isCollectionActive = true;
                break;
            }
        }

        if (!isCollectionActive && !soldOut) {
            activeCollections.push(collectionId);
        } else if (soldOut) {
            for (uint256 i = 0; i < activeCollections.length; i++) {
                if (activeCollections[i] == collectionId) {
                    activeCollections[i] = activeCollections[
                        activeCollections.length - 1
                    ];
                    activeCollections.pop();
                    break;
                }
            }
        }

        emit BalanceAdded(token, agentId, amount, collectionId);
    }

    function payRent(
        address[] memory tokens,
        uint256[] memory collectionIds,
        uint256[] memory amounts,
        uint256 agentId
    ) external {
        bool _isAgent = false;

        if (accessControls.isAgent(msg.sender)) {
            for (uint256 i = 0; i < _agents[agentId].wallets.length; i++) {
                if (_agents[agentId].wallets[i] == msg.sender) {
                    _isAgent = true;
                    break;
                }
            }
        }

        if (!_isAgent) {
            revert AAAErrors.NotAgent();
        }

        for (uint256 i = 0; i < collectionIds.length; i++) {
            if (
                _agentActiveBalances[agentId][tokens[i]][collectionIds[i]] <
                amounts[i]
            ) {
                revert AAAErrors.InsufficientBalance();
            }
        }

        devTreasury.agentPayRent(
            tokens,
            collectionIds,
            amounts,
            msg.sender,
            agentId
        );

        emit BalanceWithdrawn(tokens, collectionIds, amounts, agentId);
    }

    function getAgentCounter() public view returns (uint256) {
        return _agentCounter;
    }

    function getAgentWallets(
        uint256 agentId
    ) public view returns (address[] memory) {
        return _agents[agentId].wallets;
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

    function getAgentOwner(uint256 agentId) public view returns (address) {
        return _agents[agentId].owner;
    }

    function getAgentActiveCollectionIds(
        uint256 agentId
    ) public view returns (uint256[] memory) {
        return _agents[agentId].activeCollectionIds;
    }

    function setAccessControls(
        address payable _accessControls
    ) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }

    function setDevTreasury(address _devTreasury) external onlyAdmin {
        devTreasury = AAADevTreasury(_devTreasury);
    }

    function setMarket(address _market) external onlyAdmin {
        market = _market;
    }
}
