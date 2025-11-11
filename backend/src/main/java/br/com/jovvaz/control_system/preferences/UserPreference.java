package br.com.jovvaz.control_system.preferences;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_preferences")
public class UserPreference {
    @Id
    private String userId;

    private boolean voiceOnNewOrder = true;

    public UserPreference() {}

    public UserPreference(String userId, boolean voiceOnNewOrder) {
        this.userId = userId;
        this.voiceOnNewOrder = voiceOnNewOrder;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isVoiceOnNewOrder() {
        return voiceOnNewOrder;
    }

    public void setVoiceOnNewOrder(boolean voiceOnNewOrder) {
        this.voiceOnNewOrder = voiceOnNewOrder;
    }
}