Feature: Make sure we can see the finish button for all LEVEL TYPE levels on small screens

#  @no_mobile
#  Scenario: Can see finish button for Dance Party on desktop browser
#    Given I set up the blockly free play level for 'Dance Party'
#    And I change the browser window size to 1280 by 600
#    And I check that selector "#finishButton" is in the viewport
#
#  @no_mobile
#  Scenario: Can see finish button for Artist on desktop browser
#    Given I set up the blockly free play level for "Artist"
#    And I change the browser window size to 1280 by 600
#    And I check that selector "#finishButton" is in the viewport
#
#  @no_mobile
#  Scenario: Can see finish button for Bounce on desktop browser
#    Given I set up the blockly free play level for "Bounce"
#    And I change the browser window size to 1280 by 600
#    And element "#finishButton" is not visible
#    And I press "runButton"
#    And element "#finishButton" is visible
#    And I check that selector "#finishButton" is in the viewport

  @no_mobile
  Scenario: Can see finish button for blockly free play levels on small screens
    Given I create an authorized teacher-associated student named "Sally"
    And I sign in as "Teacher_Sally" and go home

#    And I check that the blockly free play level for "Dance Party" shows the finish button for small screens
#    And I check that the blockly free play level for "Artist" shows the finish button for small screens
#    And I check that the blockly free play level for "Bounce" shows the finish button for small screens
    And I check that the blockly free play level for "CS in Algebra" shows the finish button for small screens
    And I check that the blockly free play level for "Flappy" shows the finish button for small screens
    And I check that the minecraft free play level for "Minecraft Heroes Journey" shows the finish button for small screens
    And I check that the minecraft free play level for "Minecraft Adventurer" shows the finish button for small screens
    And I check that the minecraft free play level for "Minecraft Designer" shows the finish button for small screens
    And I check that the blockly free play level for "Sprite Lab" shows the finish button for small screens

    #And I check that the droplet free play level for "App Lab" shows the finish button for small screens
    #And I check that the droplet free play level for "Game Lab" shows the finish button for small screens


  @no_ie @no_safari @no_firefox @no_chrome
  Scenario: Can see finish for Dance Party on mobile
    Given I load the Dance Party free play level
    And I check that selector "#finishButton" is in the viewport

#CS in algebra
# https://studio.code.org/s/algebra/stage/20/puzzle/4?section_id=2713629
