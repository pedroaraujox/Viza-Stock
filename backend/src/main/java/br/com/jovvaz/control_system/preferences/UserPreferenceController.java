package br.com.jovvaz.control_system.preferences;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user-preferences")
@CrossOrigin(origins = "${CORS_ALLOWED_ORIGINS:http://localhost:5173}")
public class UserPreferenceController {
    private final UserPreferenceService service;

    public UserPreferenceController(UserPreferenceService service) {
        this.service = service;
    }

    @GetMapping("/{userId}")
    public UserPreference get(@PathVariable String userId) {
        return service.get(userId);
    }

    @PutMapping("/{userId}")
    public void update(@PathVariable String userId, @RequestBody UserPreference payload) {
        service.update(userId, payload);
    }
}