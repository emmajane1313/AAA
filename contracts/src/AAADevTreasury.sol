// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.24;

import "./AAAErrors.sol";
import "./AAAAccessControls.sol";
import "./AAAAgents.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AAADevTreasury {
    AAAAccessControls public accessControls;
    AAAAgents public agents;
    address public market;
    mapping(address => uint256) private _balance;
    mapping(address => uint256) private _services;
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

        for (uint256 i = 0; i < collectionIds.length; i++) {
            IERC20(tokens[i]).transferFrom(
                address(this),
                msg.sender,
                amounts[i]
            );

            _balance[tokens[i]] -= amounts[i];
            _services[tokens[i]] += amounts[i];
            _allTimeServices[tokens[i]] += amounts[i];
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
        market = _market;
    }
}
