package br.com.jovvaz.control_system.preferences;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/system-preferences")
@CrossOrigin(origins = "${CORS_ALLOWED_ORIGINS:http://localhost:5173}")
public class SystemPreferenceController {
    private final SystemPreferenceService service;

    public SystemPreferenceController(SystemPreferenceService service) {
        this.service = service;
    }

    @GetMapping
    public SystemPreference get() {
        return service.getGlobal();
    }

    @PutMapping
    public void update(@RequestBody SystemPreference payload) {
        service.updateGlobal(payload);
    }
}