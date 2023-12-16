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

We decided to use TypeScript for our project. For all of our security related methods we use the Crypto library.
First we implemented the generateSymmetricKey using the method crypto.createSecretKey. Then we implemented the cipherData that encrypts data with the symmetric Key we use crypto.createCipheriv to create the cipher and we use a nonce generated with crypto.randomBytes for our iv. For the decipherData we use crypto.createDecipheriv that uses the same nonce that was generated before as an IV. We then have the method protect that ciphers the data using the cipherData method and also generates the mic. The method check is used to check the integrity of the data using the mic and is used in the uprotect method that deciphers using the decipherData method and checks its integrity.

We decided that our mic inside our ProtectedData is generated using the nonce and the data before encrypting because if the mic was generated after the encryption the mic could regenerated after altering the data without it being detected.

### 2.2. Infrastructure

#### 2.2.1. Network and Machine Setup

(_Provide a brief description of the built infrastructure._)

(_Justify the choice of technologies for each server._)

#### 2.2.2. Server Communication Security

(_Discuss how server communications were secured, including the secure channel solutions implemented and any challenges encountered._)

(_Explain what keys exist at the start and how are they distributed?_)

The symmetric key is already distributed and is the only key.
We implemented the interceptor class that handles all of our encripting and decripting and respective checks in our server using our secure libraray.

What we found most dificult was the implementation of our secure library in the interceptors class because when we finally started encripting our payloads the errors were difficult to locate given the fact that we couldn't really see what our payloads contained.

### 2.3. Security Challenge

#### 2.3.1. Challenge Overview

(_Describe the new requirements introduced in the security challenge and how they impacted your original design._)

1. The payment orders new document format forced us to re-design the way payment orders were initicially created and stored.
2. Confidentiality, authenticity, and non-repudiation of each transaction forced us to generate asymmetric keys in order to sign all payment orders. We also re-designed what keys existed at the start and how the were exchanged.
3. Robust freshness measures to prevent duplicate executions of the order we had to implement a function that invalidated previously used nonces.
4. For accounts with multiple owners, e.g. Alice and Bob, require authorization and non-repudiation from all owners before the payment order is executed this forced us to store all users publick keys in order.

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
