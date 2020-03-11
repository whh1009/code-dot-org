Feature: Looking for finish
  Scenario: Can see finish
    Given I load the Dance Party free play level
    And I change the browser window size to 1300 by 720
    And I wait for 10 seconds
    And I check that selector "#finishButton" is in the viewport
