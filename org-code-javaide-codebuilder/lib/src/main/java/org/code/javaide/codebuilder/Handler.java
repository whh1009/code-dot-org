package org.code.javaide.codebuilder;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Paths;
import java.util.Map;

import org.apache.commons.io.FilenameUtils;

public class Handler implements RequestHandler<Map<String,String>, String>{
  Gson gson = new GsonBuilder().setPrettyPrinting().create();
  @Override
  public String handleRequest(Map<String,String> event, Context context)
  {
    // TODO: Handle more than one file
    if(event.size() > 1) {
      return "Error: Can only process one file at a time.";
    }

    File compileRunScript = null;
    String tempDir = System.getProperty("java.io.tmpdir");
    for(Map.Entry<String, String> entry : event.entrySet()) {
      String className = FilenameUtils.removeExtension(entry.getKey());
      String userCode = entry.getValue();
      try {
        // Build user's java file
        File userFile = new File(Paths.get(tempDir, entry.getKey()).toString());
        FileWriter writer = new FileWriter(userFile);
        writer.write(userCode);
        writer.close();

        // Create the compile & run script
        compileRunScript = File.createTempFile("script", null);
        FileWriter scriptWriter = new FileWriter(compileRunScript);
        scriptWriter.write("javac " + userFile.getAbsolutePath());
        scriptWriter.write(System.getProperty( "line.separator" ));
        scriptWriter.write("java -cp " + tempDir + " " + className);
        scriptWriter.close();
      } catch (IOException e) {
        e.printStackTrace();
        return "An error occurred creating files.";
      }
    }

    ProcessBuilder pb = new ProcessBuilder().command("bash", compileRunScript.toString());

    Process process = null;
    try {
      // Execute the user's code. Heaven help us...
      process = pb.start();
      process.waitFor();
    } catch (InterruptedException e) {
      e.printStackTrace();
      return "An error occurred running the program.";
    } catch (IOException e) {
      e.printStackTrace();
      return "An error occurred running the program.";
    }

    StringBuilder programOutput = new StringBuilder();
    try {
      // Get output from the user's program
      BufferedReader reader =
          new BufferedReader(new InputStreamReader(process.getInputStream()));
      String line = null;
      while ( (line = reader.readLine()) != null) {
         programOutput.append(line);
      }
    } catch (IOException e) {
      e.printStackTrace();
      return "An error occurred reading the program output.";
    }

    return programOutput.toString();
  }
}
