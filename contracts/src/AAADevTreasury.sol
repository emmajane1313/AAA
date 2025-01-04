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
    uint256 public ownerAmountPercent;
    uint256 public distributionAmountPercent;
    uint256 public devAmountPercent;
    mapping(address => uint256) private _balance;
    mapping(address => uint256) private _services;
    mapping(address => uint256) private _treasury;
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
    event FundsWithdrawnTreasury(address indexed token, uint256 amount);
    event FundsWithdrawnServices(address indexed token, uint256 amount);
    event FundsWithdrawnStuck(address indexed token, uint256 amount);
    event AgentPaidRent(
        address[] tokens,
        uint256[] amounts,
        uint256[] bonuses,
        address indexed agent
    );
    event OrderPayment(address token, address recipient, uint256 amount);
    event AgentOwnerPaid(address token, address owner, uint256 amount);
    event ExcessAgent(
        address token,
        uint256 amount,
        uint256 agentId,
        uint256 collectionId
    );
    event DevTreasuryAdded(address token, uint256 amount);

    constructor(address payable _accessControls) payable {
        accessControls = AAAAccessControls(_accessControls);
        ownerAmountPercent = 30;
        distributionAmountPercent = 30;
        devAmountPercent = 40;
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

    function withdrawFundsTreasury(
        address token,
        uint256 amount
    ) external onlyAdmin {
        IERC20(token).transferFrom(address(this), msg.sender, amount);
        _balance[token] -= amount;
        _treasury[token] -= amount;

        emit FundsWithdrawnTreasury(token, amount);
    }

    function withdrawFundsStuck(
        address token,
        uint256 amount
    ) external onlyAdmin {
        IERC20(token).transferFrom(address(this), msg.sender, amount);
        _balance[token] -= amount;

        emit FundsWithdrawnStuck(token, amount);
    }

    function withdrawFundsServices(
        address token,
        uint256 amount
    ) external onlyAdmin {
        IERC20(token).transferFrom(address(this), msg.sender, amount);
        _balance[token] -= amount;
        _services[token] -= amount;

        emit FundsWithdrawnServices(token, amount);
    }

    function excessAgent(
        address token,
        uint256 agentId,
        uint256 collectionId
    ) external onlyAdmin {
        uint256 _amount = agents.getAgentActiveBalance(
            token,
            agentId,
            collectionId
        );
        _services[token] += _amount;
        _allTimeServices[token] += _amount;

        emit ExcessAgent(token, _amount, agentId, collectionId);
    }

    function agentPayRent(
        address[] memory tokens,
        uint256[] memory collectionIds,
        uint256[] memory amounts,
        uint256[] memory bonuses,
        address agentWallet,
        uint256 agentId
    ) external {
        if (msg.sender != address(agents)) {
            revert AAAErrors.OnlyAgentsContract();
        }

        address _owner = agents.getAgentOwner(agentId);

        for (uint256 i = 0; i < collectionIds.length; i++) {
            _services[tokens[i]] += amounts[i];
            _allTimeServices[tokens[i]] += amounts[i];

            if (bonuses[i] > 0) {
                uint256 _ownerAmount = (bonuses[i] * ownerAmountPercent) / 100;
                uint256 _devAmount = (bonuses[i] * devAmountPercent) / 100;
                uint256 _distributionAmount = (bonuses[i] *
                    distributionAmountPercent) / 100;

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

                        if (
                            IERC20(tokens[i]).transfer(_collectors[j], payment)
                        ) {
                            emit OrderPayment(
                                tokens[i],
                                _collectors[j],
                                payment
                            );
                        }
                    }
                }

                if (IERC20(tokens[i]).transfer(_owner, _ownerAmount)) {
                    emit AgentOwnerPaid(tokens[i], _owner, _ownerAmount);
                }

                _treasury[tokens[i]] += _devAmount;
                emit DevTreasuryAdded(tokens[i], _devAmount);
            }
        }

        emit AgentPaidRent(tokens, amounts, bonuses, agentWallet);
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

    function getTreasuryByToken(address token) public view returns (uint256) {
        return _treasury[token];
    }

    function setAccessControls(
        address payable _accessControls
    ) external onlyAdmin {
        accessControls = AAAAccessControls(_accessControls);
    }

    function setAgents(address _agents) external onlyAdmin {
        agents = AAAAgents(_agents);
    }

    function setMarket(address _market) external onlyAdmin {
        market = AAAMarket(_market);
    }

    function setAmounts(
        uint256 _ownerAmountPercent,
        uint256 _distributionAmountPercent,
        uint256 _devAmountPercent
    ) external onlyAdmin {
        ownerAmountPercent = _ownerAmountPercent;
        distributionAmountPercent = _distributionAmountPercent;
        devAmountPercent = _devAmountPercent;
    }
}
