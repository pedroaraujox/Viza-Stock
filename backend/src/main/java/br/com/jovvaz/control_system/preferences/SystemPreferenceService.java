package br.com.jovvaz.control_system.preferences;

import org.springframework.stereotype.Service;

@Service
public class SystemPreferenceService {
    private static final String GLOBAL_ID = "GLOBAL";
    private final SystemPreferenceRepository repository;

    public SystemPreferenceService(SystemPreferenceRepository repository) {
        this.repository = repository;
    }

    public SystemPreference getGlobal() {
        return repository.findById(GLOBAL_ID).orElseGet(() -> repository.save(new SystemPreference(GLOBAL_ID, true)));
    }

    public SystemPreference updateGlobal(SystemPreference payload) {
        SystemPreference current = repository.findById(GLOBAL_ID).orElseGet(() -> new SystemPreference(GLOBAL_ID, true));
        current.setVoiceOnNewOrder(payload.isVoiceOnNewOrder());
        return repository.save(current);
    }
}