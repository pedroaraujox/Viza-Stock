package br.com.jovvaz.control_system.preferences;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemPreferenceRepository extends JpaRepository<SystemPreference, String> {
}