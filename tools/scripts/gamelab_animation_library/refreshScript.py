import csv
import os

with open('gamelab.csv') as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if line_count == 0:
            print('Column names are')
            print(row)
            line_count += 1
        else:
            print('file location: '+row[5])
            print('category: '+row[2])
            print('aliases: '+row[4])
            whatToRun = "bundle exec ../refreshAnimationMetadata.rb " + row[5] + " --categories "+row[2] + " --aliases "+row[4]
            print(whatToRun)
            os.system(whatToRun)
            print()
            line_count += 1
    print('Processed: '+str(line_count))