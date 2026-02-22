package com.hema.hemspire.service;

import com.hema.hemspire.dto.ContactRequest;
import com.hema.hemspire.entity.ContactMessage;
import com.hema.hemspire.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    public ContactMessage submit(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.getName().trim());
        message.setEmail(request.getEmail().trim());
        message.setSubject(request.getSubject().trim());
        message.setMessage(request.getMessage().trim());
        return contactMessageRepository.save(message);
    }
}
