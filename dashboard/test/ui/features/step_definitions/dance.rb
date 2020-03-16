# Helper steps for dance party levels

blockly_free_play_level_urls = {
}

droplet_free_play_level_urls = {
}

free_play_level_urls = {
  'blockly' => {
     'Dance Party' => 'http://studio.code.org/s/dance/stage/1/puzzle/13?noautoplay=true',
     'Artist' => 'http://studio.code.org/s/20-hour/stage/5/puzzle/10?noautoplay=true',
     'Bounce' => 'http://studio.code.org/s/course3/stage/15/puzzle/10?noautoplay=true',
     'CS in Algebra' => 'http://studio.code.org/s/algebra/stage/1/puzzle/2?noautoplay=true',
     'Flappy' => 'http://studio.code.org/flappy/10?noautoplay=true',
     'Minecraft Aquatic' => 'http://studio.code.org/s/aquatic/stage/1/puzzle/12?noautoplay=true',
     'Minecraft Heroes Journey' => 'http://studio.code.org/s/hero/stage/1/puzzle/12?noautoplay=true',
     'Minecraft Adventurer' => 'http://studio.code.org/s/mc/stage/1/puzzle/14?noautoplay=true',
     'Minecraft Designer' => 'http://studio.code.org/s/minecraft/stage/1/puzzle/12?noautoplay=true',
     'Sprite Lab' => 'http://studio.code.org/s/coursee-2018/stage/20/puzzle/9?noautoplay=true'
  },
  'droplet' => {
    'App Lab' => 'http://studio.code.org/s/applab-intro/stage/1/puzzle/15?noautoplay=true',
    'Game Lab' => 'http://studio.code.org/s/csd3-2019/stage/22/puzzle/12?noautoplay=true'
  }
}

When /^I check that the (blockly|droplet|minecraft) free play level for "([^"]*)" shows the finish button for small screens/i do |level_type, level_name|
  individual_steps <<-STEPS
    And I set up the #{level_type} free play level for "#{level_name}"
    And I change the browser window size to 1280 by 600
    And I wait until the Minecraft game is loaded
    And I press "runButton"
    And I check that selector "button:contains('Finish')" is in the viewport
  STEPS
end

When /^I set up the (blockly|droplet) free play level for "([^"]*)"/i do |level_type, level_name|
  individual_steps <<-STEPS
    And I am on "#{free_play_level_urls[level_type][level_name]}"
    And I rotate to landscape
    And I wait until I see selector "#runButton"
    And I bypass the age dialog
    And I close the instructions overlay if it exists
  STEPS
end
  

When /^I bypass the age dialog/i do
  els = @browser.find_elements(:css, '#uitest-age-selector')
  unless els.empty?
    select = Selenium::WebDriver::Support::Select.new(els[0])
    select.select_by(:text, '20')
    button = @browser.find_element(:css, '#uitest-submit-age')
    button.click
  end
end
