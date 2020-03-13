Feature: Make sure we can see the finish button for all LEVEL TYPE levels on small screens

#  @no_mobile
#  Scenario: Can see finish button for Dance Party on desktop browser
#    Given I load the Dance Party free play level
#    And I change the browser window size to 1280 by 600
#    And I check that selector "#finishButton" is in the viewport
#
#  @no_mobile
#  Scenario: Can see finish button for Artist on desktop browser
#    Given I load the Artist free play level
#    And I change the browser window size to 1280 by 600
#    And I check that selector "#finishButton" is in the viewport

  @no_mobile
  Scenario: Can see finish button for Bounce on desktop browser
    Given I load the Bounce free play level
    And I change the browser window size to 1280 by 600
    And element "#finishButton" is not visible
    And I press "runButton"
    And element "#finishButton" is visible
    And I check that selector "#finishButton" is in the viewport


  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: Can see finish for Dance Party on mobile
    Given I load the Dance Party free play level
    And I check that selector "#finishButton" is in the viewport
