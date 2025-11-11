package br.com.jovvaz.control_system.preferences;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_preferences")
public class SystemPreference {
    @Id
    private String id;

    private boolean voiceOnNewOrder = true;

    public SystemPreference() {}

    public SystemPreference(String id, boolean voiceOnNewOrder) {
        this.id = id;
        this.voiceOnNewOrder = voiceOnNewOrder;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean isVoiceOnNewOrder() {
        return voiceOnNewOrder;
    }

    public void setVoiceOnNewOrder(boolean voiceOnNewOrder) {
        this.voiceOnNewOrder = voiceOnNewOrder;
    }
}