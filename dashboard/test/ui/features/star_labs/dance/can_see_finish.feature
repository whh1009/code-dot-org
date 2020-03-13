Feature: Looking for finish - desktop

  @no_mobile
  Scenario: Can see finish
    Given I load the Dance Party free play level
    And I change the browser window size to 1280 by 600
    And I check that selector "#finishButton" is in the viewport

  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: Can see finish
    Given I load the Dance Party free play level
    And I check that selector "#finishButton" is in the viewport
