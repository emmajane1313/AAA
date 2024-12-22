// SPDX-License-Identifier: UNLICENSE
pragma solidity 0.8.24;

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
