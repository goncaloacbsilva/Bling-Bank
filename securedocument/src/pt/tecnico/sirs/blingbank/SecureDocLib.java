package pt.tecnico.sirs.blingbank;

import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;

import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class SecureDocLib {

    private JsonObject readData(String filePath) throws IOException {
        Gson gson = new Gson();
        try (FileReader fileReader = new FileReader(filePath)) {
            return gson.fromJson(fileReader, JsonObject.class);
        }
    }

    private void writeData(JsonObject data, String path) throws IOException {
        Gson gson = new GsonBuilder().setPrettyPrinting().create();
        File file = new File(path);
        file.createNewFile();
        try (FileWriter fileWriter = new FileWriter(path)) {
            gson.toJson(data, fileWriter);
        }
    }

    private String createMIC(Pair<String, String> cipheredData) throws InvalidKeyException {
        Gson gson = new Gson();

        JsonObject protectedContent = new JsonObject();
        protectedContent.addProperty("data", cipheredData.getLeft());
        protectedContent.addProperty("nonce", cipheredData.getRight());

        // check command only accepts input file, therefore we'll use MIC (SHA-256)
        // instead of MAC (HmacSHA256)

        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            messageDigest.update(gson.toJson(protectedContent).getBytes());
            return Base64.getEncoder().encodeToString(messageDigest.digest());
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return "";
        }
    }

    private boolean micMatch(String mic, Pair<String, String> cipheredData) throws InvalidKeyException {
        return createMIC(cipheredData).equals(mic);
    }

    private byte[] generateNonce(int nonceSize) {
        SecureRandom random = new SecureRandom();
        byte bytes[] = new byte[nonceSize];
        random.nextBytes(bytes);
        return bytes;
    }

    private Pair<String, String> cipherData(JsonObject data, Key secret) {
        try {
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");

            byte[] nonce = generateNonce(cipher.getBlockSize());
            IvParameterSpec ivSpec = new IvParameterSpec(nonce);

            cipher.init(Cipher.ENCRYPT_MODE, secret, ivSpec);

            String cipheredContent = Base64.getEncoder().encodeToString(cipher.doFinal(data.toString().getBytes()));
            String encodedNonce = Base64.getEncoder().encodeToString(nonce);

            return new ImmutablePair<String, String>(cipheredContent, encodedNonce);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public JsonObject decipherData(String cipheredContent, String encodedNonce, Key secret) {
        try {
            byte[] decodedNonce = Base64.getDecoder().decode(encodedNonce);
            IvParameterSpec ivSpec = new IvParameterSpec(decodedNonce);

            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, secret, ivSpec);

            byte[] decipheredBytes = cipher.doFinal(Base64.getDecoder().decode(cipheredContent));
            String decipheredString = new String(decipheredBytes, StandardCharsets.UTF_8);
            return JsonParser.parseString(decipheredString).getAsJsonObject();

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public void protect(String filePathIn, String filePathOut, Key secret) throws Exception {
        JsonObject document = this.readData(filePathIn);

        Pair<String, String> cipheredData = cipherData(document, secret);
        String mic = createMIC(cipheredData);

        JsonObject protectedDocument = new JsonObject();
        protectedDocument.addProperty("mic", mic);
        protectedDocument.addProperty("nonce", cipheredData.getRight());
        protectedDocument.addProperty("data", cipheredData.getLeft());

        this.writeData(protectedDocument, filePathOut);
    }

    public boolean check(String filePath) throws Exception {

        JsonObject document = this.readData(filePath);

        String extractMic = document.get("mic").getAsString();
        String extractNonce = document.get("nonce").getAsString();
        String extractData = document.get("data").getAsString();

        return micMatch(extractMic, new ImmutablePair<String, String>(extractData, extractNonce));

    }

    public void unprotect(String filePathIn, String filePathOut, Key key) throws Exception {

        JsonObject document = this.readData(filePathIn);

        if (check(filePathIn)) {

            String extractNonce = document.get("nonce").getAsString();
            String extractData = document.get("data").getAsString();
            JsonObject decipherData = decipherData(extractData, extractNonce, key);

            this.writeData(decipherData, filePathOut);
        }

    }

}
