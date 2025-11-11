package br.com.jovvaz.control_system.preferences;

import org.springframework.stereotype.Service;

@Service
public class UserPreferenceService {
    private final UserPreferenceRepository repository;

    public UserPreferenceService(UserPreferenceRepository repository) {
        this.repository = repository;
    }

    public UserPreference get(String userId) {
        return repository.findById(userId).orElseGet(() -> {
            UserPreference pref = new UserPreference(userId, true);
            return repository.save(pref);
        });
    }

    public UserPreference update(String userId, UserPreference payload) {
        UserPreference current = repository.findById(userId).orElseGet(() -> new UserPreference(userId, true));
        current.setVoiceOnNewOrder(payload.isVoiceOnNewOrder());
        return repository.save(current);
    }
}