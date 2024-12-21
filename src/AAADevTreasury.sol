// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "./AAAErrors.sol";
import "./AAAAccessControls.sol";
import "./AAAAgents.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract AAADevTreasury {
    AAAAccessControls public accessControls;
    AAAAgents public agents;
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

    constructor(address _accessControls) {
        accessControls = AAAAccessControls(_accessControls);
    }

    function receiveFunds(
        address buyer,
        address paymentToken,
        uint256 amount
    ) external {
        if (IERC20(paymentToken).balanceOf(buyer) < amount) {
            revert AAAErrors.InsufficientBalance();
        }

        _balance[paymentToken] += amount;

        if (!IERC20(paymentToken).transferFrom(buyer, address(this), amount)) {
            revert AAAErrors.PaymentFailed();
        }

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
}
