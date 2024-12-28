// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.24;

import "./AAAErrors.sol";
import "./AAAAccessControls.sol";
import "./AAAAgents.sol";
import "./AAAMarket.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AAADevTreasury {
    AAAAccessControls public accessControls;
    AAAAgents public agents;
    AAAMarket public market;
    mapping(address => uint256) private _balance;
    mapping(address => uint256) private _services;
    mapping(uint256 => mapping(address => uint256)) private _collectorPayment;
    mapping(address => uint256) private _allTimeBalance;
    mapping(address => uint256) private _allTimeServices;

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
        address[] tokens,
        uint256[] amounts,
        address indexed agent
    );
    event OrderPayment(address token, address recipient, uint256 amount);
    event AgentOwnerPaid(address token, address owner, uint256 amount);

    constructor(address _accessControls) payable {
        accessControls = AAAAccessControls(_accessControls);
    }

    function receiveFunds(
        address buyer,
        address paymentToken,
        uint256 amount
    ) external {
        if (msg.sender != address(market)) {
            revert AAAErrors.OnlyMarketContract();
        }
        _balance[paymentToken] += amount;
        _allTimeBalance[paymentToken] += amount;

        emit FundsReceived(buyer, paymentToken, amount);
    }

    function withdrawFunds(address token, uint256 amount) external onlyAdmin {
        IERC20(token).transferFrom(address(this), msg.sender, amount);

        _balance[token] -= amount;

        emit FundsWithdrawn(token, amount);
    }

    function withdrawFundsStuck(
        address token,
        uint256 amount
    ) external onlyAdmin {
        IERC20(token).transferFrom(address(this), msg.sender, amount);

        emit FundsWithdrawn(token, amount);
    }

    function withdrawFundsServices(
        address token,
        uint256 amount
    ) external onlyAdmin {
        IERC20(token).transferFrom(address(this), msg.sender, amount);

        _services[token] -= amount;

        emit FundsWithdrawn(token, amount);
    }

    function agentPayRent(
        address[] memory tokens,
        uint256[] memory collectionIds,
        uint256[] memory amounts,
        uint256 agentId
    ) external {
        if (msg.sender != address(agents)) {
            revert AAAErrors.OnlyAgentsContract();
        }

        address _owner = agents.getAgentOwner(agentId);

        for (uint256 i = 0; i < collectionIds.length; i++) {
            _balance[tokens[i]] -= amounts[i];

            uint256 _ownerAmount = (amounts[i] * 20) / 100;
            uint256 _serviceAmount = (amounts[i] * 40) / 100;
            uint256 _distributionAmount = (amounts[i] * 40) / 100;

            _services[tokens[i]] += _serviceAmount;
            _allTimeServices[tokens[i]] += _serviceAmount;

            address[] memory _collectors = market
                .getAllCollectorsByCollectionId(collectionIds[i]);

            uint256 totalWeight = 0;
            for (uint256 j = 1; j <= _collectors.length; j++) {
                totalWeight += 1e18 / j;
            }

            for (uint256 j = 0; j < _collectors.length; j++) {
                if (_collectors[j] != address(0)) {
                    uint256 weight = 1e18 / (j + 1);
                    uint256 payment = (_distributionAmount * weight) /
                        totalWeight;

                    _collectorPayment[collectionIds[i]][
                        _collectors[j]
                    ] = payment;

                    if (IERC20(tokens[i]).transfer(_collectors[j], payment)) {
                        emit OrderPayment(tokens[i], _collectors[j], payment);
                    }
                }
            }

            if (IERC20(tokens[i]).transfer(_owner, _ownerAmount)) {
                emit AgentOwnerPaid(tokens[i], _owner, _ownerAmount);
            }
        }

        emit AgentFundsWithdrawn(
            tokens,
            amounts,
            agents.getAgentWallet(agentId)
        );
    }

    function getBalanceByToken(address token) public view returns (uint256) {
        return _balance[token];
    }

    function getServicesPaidByToken(
        address token
    ) public view returns (uint256) {
        return _services[token];
    }

    function getAllTimeBalanceByToken(
        address token
    ) public view returns (uint256) {
        return _allTimeBalance[token];
    }

    function getAllTimeServices(address token) public view returns (uint256) {
        return _allTimeServices[token];
    }

    function setAccessControls(address _accessControls) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }

    function setAgents(address _agents) external onlyAdmin {
        agents = AAAAgents(_agents);
    }

    function setMarket(address _market) external onlyAdmin {
        market = AAAMarket(_market);
    }
}
