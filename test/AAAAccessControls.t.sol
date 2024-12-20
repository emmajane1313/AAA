// SPDX-License-Identifier: UNLICENSE
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "src/AAAAccessControls.sol";
import "src/AAAErrors.sol";

contract AAAAccessControlsTest is Test {
    AAAAccessControls private accessControls;
    address private admin1 = address(0x123);
    address private admin2 = address(0x456);
    address private agent1 = address(0x789);
    address private agent2 = address(0xABC);

    function setUp() public {
        accessControls = new AAAAccessControls();
    }

    function testConstructor() public view {
        assertTrue(accessControls.isAdmin(address(this)));
    }

    function testAddAdmin() public {
        accessControls.addAdmin(admin1);
        assertTrue(accessControls.isAdmin(admin1));
    }

    function testAddAdminRevertIfAlreadyExists() public {
        accessControls.addAdmin(admin1);
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.AdminAlreadyExists.selector)
        );
        accessControls.addAdmin(admin1);
    }

    function testRemoveAdmin() public {
        accessControls.addAdmin(admin1);
        accessControls.removeAdmin(admin1);
        assertFalse(accessControls.isAdmin(admin1));
    }

    function testRemoveAdminRevertIfDoesNotExist() public {
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.AdminDoesntExist.selector)
        );
        accessControls.removeAdmin(admin1);
    }

    function testRemoveAdminRevertIfRemovingSelf() public {
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.CannotRemoveSelf.selector)
        );
        accessControls.removeAdmin(address(this));
    }

    function testAddAgent() public {
        accessControls.addAgent(agent1);
        assertTrue(accessControls.isAgent(agent1));
    }

    function testAddAgentRevertIfAlreadyExists() public {
        accessControls.addAgent(agent1);
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.AgentAlreadyExists.selector)
        );
        accessControls.addAgent(agent1);
    }

    function testRemoveAgent() public {
        accessControls.addAgent(agent1);
        accessControls.removeAgent(agent1);
        assertFalse(accessControls.isAgent(agent1));
    }

    function testRemoveAgentRevertIfDoesNotExist() public {
        vm.expectRevert(
            abi.encodeWithSelector(AAAErrors.AgentDoesntExist.selector)
        );
        accessControls.removeAgent(agent1);
    }

    function testIsAdmin() public {
        assertTrue(accessControls.isAdmin(address(this)));
        accessControls.addAdmin(admin1);
        assertTrue(accessControls.isAdmin(admin1));
        assertFalse(accessControls.isAdmin(agent1));
    }

    function testIsAgent() public {
        accessControls.addAgent(agent1);
        assertTrue(accessControls.isAgent(agent1));
        assertFalse(accessControls.isAgent(admin1));
    }

    function testOnlyAdminModifier() public {
        vm.prank(admin1);
        vm.expectRevert("Not an admin");
        accessControls.addAdmin(admin2);
    }
}
