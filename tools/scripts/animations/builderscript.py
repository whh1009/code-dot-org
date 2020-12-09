import csv
import os

with open('pass2-icons.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            print('Column names are')
            print(row)
            line_count += 1
        else:
            print('file location: '+row[1])
            print('category: '+row[3])
            print('aliases: '+row[2])
            newFileLocation = "../new_gamelab_animation_library/category_"+row[3]+"/"+row[0]
            theMove = "cp "+row[1] + " " + newFileLocation
            print(theMove)
            os.system(theMove)
            whatToRun = "bundle exec ../generateSingleFrameAnimationMetadata.rb " + newFileLocation + " --categories "+row[3] + " --aliases "+row[2]
            print(whatToRun)
            os.system(whatToRun)
            line_count += 1
    print('Processed: '+str(line_count))