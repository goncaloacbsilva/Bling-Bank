# C49 BlingBank Project Report

## 1. Introduction

(_Provide a brief overview of your project, including the business scenario and the main components: secure documents, infrastructure, and security challenge._)

(_Include a structural diagram, in UML or other standard notation._)

Our project, BlingBank, is a contemporary digital financial platform built on the principles of accessibility and convenience. It provides an online banking platform accessible via a web application.
We implement a secure library that has methods that allow us to guarantee confidentiality, authenticity, and non-repudiation of each transaction.
The infrastructure is divided into three big layers: client, server, and database. In between the client and the server, there is a router, and in between the server and the database, there is a ...


## 2. Project Development

### 2.1. Secure Document Format

#### 2.1.1. Design

(_Outline the design of your custom cryptographic library and the rationale behind your design choices, focusing on how it addresses the specific needs of your chosen business scenario._)

(_Include a complete example of your data format, with the designed protections._)

Our cryptographic library implements methods for our session key such as generateSymmetricKey to generate that key and also methods that use that same key for encription (cipherData) and decription (decipherData). To generate our IV used in these functions to cipher and decipher we use a nonce calculated from the crypto.randomBytes library.
We also use the aes-256-cbc algorithm because the 256-bit key size provides a large number of possible key combinations, making it computationally impossible to break through brute force attacks. Additionally, the CBC mode introduces a level of diffusion, where each block of plaintext depends on the previous block, enhancing the overall security of the encryption.
We chose the document format below because its the most efficient and secure for all the operatons we need to preform when the data arrives we need to check it's integriry so we decipher the data and check the integrity(check) the ciphering and deciphering and the check are all handled by the functions protect that does the ciphering and puts the data in the ProtectedData format and unprotect that deciphers and checks the integrity of the data and this function also recives a ProtectedData format.
```
export interface ProtectedData {
  mic: string;
  nonce: string;
  data: string;
}
```

#### 2.1.2. Implementation

(_Detail the implementation process, including the programming language and cryptographic libraries used._)

(_Include challenges faced and how they were overcome._)

We decided to use TypeScript for our project. Also we decided to use mongoDB for our database, for all of our security related methods we use the Crypto library.
First we decided to implement the server more specifically the account service and its end points, we tested them using postman.
After testing that our gets and posts were all working connection with the database was established.
Then, we implemented the interceptor class that handles all of our encripting and decripting and respective checks in our server.
Finally, we implemented the client so that we could start associating the accounts to users.

What we found most dificult was the implementation of our secure library in the interceptors class because when we finally started encripting our payloads the errors were difficult to locate given the fact that we couldn't really see what our payloads contained.

### 2.2. Infrastructure

#### 2.2.1. Network and Machine Setup

(_Provide a brief description of the built infrastructure._)

(_Justify the choice of technologies for each server._)

#### 2.2.2. Server Communication Security

(_Discuss how server communications were secured, including the secure channel solutions implemented and any challenges encountered._)

(_Explain what keys exist at the start and how are they distributed?_)

### 2.3. Security Challenge

#### 2.3.1. Challenge Overview

(_Describe the new requirements introduced in the security challenge and how they impacted your original design._)

#### 2.3.2. Attacker Model

(_Define who is fully trusted, partially trusted, or untrusted._)

(_Define how powerful the attacker is, with capabilities and limitations, i.e., what can he do and what he cannot do_)

#### 2.3.3. Solution Design and Implementation

(_Explain how your team redesigned and extended the solution to meet the security challenge, including key distribution and other security measures._)

(_Identify communication entities and the messages they exchange with a UML sequence or collaboration diagram._)  

## 3. Conclusion

(_State the main achievements of your work._)

(_Describe which requirements were satisfied, partially satisfied, or not satisfied; with a brief justification for each one._)

(_Identify possible enhancements in the future._)

(_Offer a concluding statement, emphasizing the value of the project experience._)

## 4. Bibliography

(_Present bibliographic references, with clickable links. Always include at least the authors, title, "where published", and year._)

----
END OF REPORT
