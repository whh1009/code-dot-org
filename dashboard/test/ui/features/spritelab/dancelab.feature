@no_older_chrome
Feature: Dance Lab
  Scenario: Song selector is visible and doesn't display pg13 songs for age < 13
    Given I create a young student named "Harry"
    And I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"
    And I sign out

  Scenario: Song selector is visible and displays all songs for age > 13
    Given I create a student named "Ron"
    And I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Jazzy_beats is available on local and isawthesign is available on test
    And I see option "jazzy_beats" or "isawthesign_aceofbase" in the dropdown "#song_selector"
    And I sign out

  Scenario: Selecting <13 in age dialog turns filter on
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And element ".signInOrAgeDialog" is visible
    And I select the "10" option in dropdown "uitest-age-selector"
    And I click selector "#uitest-submit-age"

    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Local PG-13 option should not be visible after filter in any environment
    And I do not see "synthesize" option in the dropdown "#song_selector"
    #Test PG-13 option should not be visible after filter in any environment
    And I do not see "shapeofyou_edsheeran" option in the dropdown "#song_selector"

  Scenario: Selecting 13 in age dialog turns filter off
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And element ".signInOrAgeDialog" is visible
    And I select the "13" option in dropdown "uitest-age-selector"
    And I click selector "#uitest-submit-age"

    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#song_selector" is visible
    #Jazzy_beats is available on local and isawthesign is available on test
    And I see option "jazzy_beats" or "isawthesign_aceofbase" in the dropdown "#song_selector"

  # This test relies on CloudFront signed cookies on the test machine, and
  # relies on SoundLibraryApi in CircleCI.
  @no_firefox
  @no_safari
  Scenario: Restricted audio content is protected
    When I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does not contain "placeholder for testing"

    When I am on "http://studio.code.org/s/dance/stage/1/puzzle/1"
    And I wait for the page to fully load
    And I am on "http://studio.code.org/restricted/placeholder.txt"
    Then page text does contain "placeholder for testing"

  Scenario: Can toggle run/reset in DanceLab
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
    Then I click selector "#runButton" once I see it
    Then I wait until element "#runButton" is not visible
    And element "#resetButton" is visible
    Then I click selector "#resetButton" once I see it
    Then element "#runButton" is visible
    And element "#resetButton" is hidden

  Scenario: Can get to level success in DanceLab
    Given I am on "http://studio.code.org/s/allthethings/stage/37/puzzle/1?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I wait for 3 seconds
    And I wait until I don't see selector "#p5_loading"
    And I close the instructions overlay if it exists

    #Run for two measures until level success
    Then I click selector "#runButton" once I see it
    And I wait until element ".congrats" is visible

  @as_student
  Scenario: Dance Party Share
    Given I am on "http://studio.code.org/s/dance/stage/1/puzzle/13?noautoplay=true"
    And I rotate to landscape
    And I wait for the page to fully load
    And I close the instructions overlay if it exists

    When I navigate to the shared version of my project
    Then I click selector "#runButton" once I see it
    Then I wait until element "#runButton" is not visible

    Then evaluate JavaScript expression "window.__DanceTestInterface.getSprites().length === 3"
    
    Then I click selector "#resetButton" once I see it
    Then element "#runButton" is visible
    And element "#resetButton" is hidden
