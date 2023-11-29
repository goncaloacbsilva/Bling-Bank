package pt.tecnico.sirs.blingbank;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.Key;
import java.util.Scanner;

import javax.crypto.spec.SecretKeySpec;

public class SecureDocumentCLI {

    private static byte[] readFile(String path) throws FileNotFoundException, IOException {
        FileInputStream fis = new FileInputStream(path);
        byte[] content = new byte[fis.available()];
        fis.read(content);
        fis.close();
        return content;
    }

    private static Key readSecretKey(String secretKeyPath) throws Exception {
        byte[] encoded = readFile(secretKeyPath);
        SecretKeySpec keySpec = new SecretKeySpec(encoded, "AES");
        return keySpec;
    }

    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        SecureDocLib secLib = new SecureDocLib();
        File file;
        if (args.length >= 1) {
            // add tool verification
            switch (args[0].toLowerCase()) {
                case "h":
                case "help":
                    System.out.println("(tool-name) help -- displays the commands avaliable");
                    System.out.println(
                            "(tool-name) protect (input-file) (output-file) -- add security to a document");
                    System.out.println("(tool-name) check (input-file) -- checks the integrity of a file");
                    System.out.println(
                            "(tool-name) unprotect (input-file) (output-file) -- remove security from a document");
                    System.out.println("(tool-name) exit -- to exit the program");
                    break;
                case "p":
                case "protect":
                    if (args.length < 3) {
                        System.out.println("ERROR");
                        System.out.println("Not enough parameters");
                    }
                    file = new File(args[1]);
                    if (!file.exists()) {
                        System.out.println("ERROR");
                        System.out.println("input file doesn't exist");
                        break;
                    }
                    secLib.protect(args[1], args[2], readSecretKey(args[3]));
                    System.out.println("File " + args[1] + " protected and outputed as " + args[2]);
                    break;
                case "c":
                case "check":
                    if (args.length < 2) {
                        System.out.println("ERROR");
                        System.out.println("Not enough parameters");
                    }
                    file = new File(args[1]);
                    if (!file.exists()) {
                        System.out.println("ERROR");
                        System.out.println("input file doesn't exist");
                        break;
                    }
                    if (secLib.check(args[1])) {
                        System.out.println("File " + args[1] + " integrity is verified");
                    } else {
                        System.out.println("ERROR");
                        System.out.println("File " + args[1] + " integrity was broken");
                    }

                    break;
                case "u":
                case "unprotect":
                    if (args.length < 3) {
                        System.out.println("ERROR");
                        System.out.println("Not enough parameters");
                    }
                    file = new File(args[1]);
                    if (!file.exists()) {
                        System.out.println("ERROR");
                        System.out.println("input file doesn't exist");
                        break;
                    }
                    secLib.unprotect(args[1], args[2], readSecretKey(args[3]));
                    System.out.println("File " + args[1] + " unprotected and outputed as " + args[2]);
                    break;
                case "q":
                case "quit":
                    scanner.close();
                    System.exit(0);
                    break;
                default:
                    System.out.println("ERROR");
                    System.out.println("Command not found");
                    break;
            }
        } else {
            System.out.println("ERROR");
            System.out.println("Not enough parameters");
        }
    }
}
