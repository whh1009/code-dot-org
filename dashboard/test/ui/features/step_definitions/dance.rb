# Helper steps for dance party levels

Given /^I load the Dance Party free play level/i do
#  individual_steps <<-STEPS
#    And I am on "http://studio.code.org/s/dance/stage/1/puzzle/13?noautoplay=true"
#    And I set up the LEVEL TYPE level
  individual_steps <<-STEPS
    And I set up the STAR LABS level with url "http://studio.code.org/s/dance/stage/1/puzzle/13?noautoplay=true"
  STEPS
end

Given /^I load the Dance Party project level/i do
  individual_steps <<-STEPS
    And I am on "http://studio.code.org/projects/dance/new"
    And I set up the LEVEL TYPE level
  STEPS
end

Given /^I load the Artist free play level/i do
#  individual_steps <<-STEPS
#    And I am on "http://studio.code.org/s//20-hour/stage/5/puzzle/10?noautoplay=true"
#   And I set up the LEVEL TYPE level
# STEPS
  individual_steps <<-STEPS
    And I set up the STAR LABS level with url "http://studio.code.org/s/20-hour/stage/5/puzzle/10?noautoplay=true"
  STEPS
end 

Given /^I load the Bounce free play level/i do
  individual_steps <<-STEPS
    And I set up the STAR LABS level with url "http://studio.code.org/s/course3/stage/15/puzzle/10?noautoplay=true"
  STEPS
end

#Given /^I am on "([^"]*)"$/ do |url|
When /^I set up the STAR LABS level with url "([^"]*)"/i do |url|
  individual_steps <<-STEPS
    And I am on "#{url}"
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
